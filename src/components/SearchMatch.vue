<script setup lang="ts">
import { computed } from "vue";
import { File, isDirectory, getPath, getUrl } from "@/file";

interface Props {
  file: File;
  start: number;
  end: number;
}

const props = defineProps<Props>();

interface Events {
  (e: "open", file: File, payload: MouseEvent): void;
}

const emit = defineEmits<Events>();

const target = computed((): string | undefined => {
  if (isDirectory(props.file)) return;
  return "_blank";
});

const href = computed((): string | undefined => {
  if (isDirectory(props.file)) return;
  return getUrl(props.file);
});

const filename = computed((): string[] => {
  const absolute = getPath(props.file);
  const name = props.file.name;
  const index = absolute.length - name.length;

  const before = name.substring(0, props.start - index);
  const after = name.substring(props.end - index);
  const match = name.substring(props.start - index, props.end - index);

  return [before, match, after];
});

const absolutpath = computed((): string[] => {
  const absolute = getPath(props.file);
  const before = absolute.substring(0, props.start);
  const match = absolute.substring(props.start, props.end);
  const after = absolute.substring(props.end);

  return [before, match, after];
});

const open = (event: MouseEvent) => {
  if (isDirectory(props.file)) emit("open", props.file, event);
};
</script>

<template>
  <a draggable="false" :href="href" :target="target" @click="open">
    <i v-if="isDirectory(file)" class="bx bxs-folder"></i>
    <i v-else class="bx bx-file-blank"></i>
    <div class="details">
      <span class="name">
        <span>{{ filename[0] }}</span>
        <span class="match">{{ filename[1] }}</span>
        <span>{{ filename[2] }}</span>
      </span>
      <span>
        <span class="prefix">Location:&nbsp;</span>
        <span>{{ absolutpath[0] }}</span>
        <span class="match">{{ absolutpath[1] }}</span>
        <span>{{ absolutpath[2] }}</span>
      </span>
    </div>
    <span class="flex"></span>
    <span>{{ "\u2BA8" }}</span>
  </a>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

a {
  display: flex;
  flex-direction: row;
  align-items: center;
  text-decoration: none;
  padding: $fib-6 * 1px $fib-5 * 1px;

  & > i {
    font-size: large;
    margin-right: $fib-6 * 1px;
    margin-left: $fib-5 * 1px;
    color: var(--color-text-secondary);
  }

  & > span {
    font-size: $fib-7 * 1px;
    margin-right: $fib-6 * 1px;
    color: var(--color-accent);
    text-decoration: none;

    &.flex {
      width: 100%;
    }
  }

  &:not(:hover) > span {
    visibility: hidden;
  }
}

.details {
  display: flex;
  flex-direction: column;

  span {
    color: var(--color-text-secondary);
    white-space: nowrap;

    &.name {
      font-size: larger;
      min-width: fit-content;
    }

    &.match {
      color: var(--color-accent);
      font-weight: 600;
    }

    &.prefix {
      font-weight: 600;
    }
  }
}
</style>
