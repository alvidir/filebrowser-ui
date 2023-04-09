<script setup lang="ts">
import { defineProps, computed } from "vue";
import SearchMatch from "@/domain/search";
import { pathSeparator } from "@/domain/path";
import { useDirectoryStore } from "@/stores/directory";

const directoryStore = useDirectoryStore();

interface Props {
  match: SearchMatch;
}

const props = defineProps<Props>();

const href = computed((): string => {
  if (props.match.file.isDirectory()) return "#";
  return props.match.file.url() ?? "#";
});

const target = computed((): string | undefined => {
  if (props.match.file.isDirectory()) return;
  return "_blank";
});

const filename = computed((): string[] => {
  const absolute = props.match.file.path();
  const index = absolute.lastIndexOf(pathSeparator) + 1;
  const name = props.match.file.name;

  const before = name.substring(0, props.match.start - index);
  const after = name.substring(props.match.end - index);
  const match = name.substring(
    props.match.start - index,
    props.match.end - index
  );

  return [before, match, after];
});

const absolutpath = computed((): string[] => {
  const absolute = props.match.file.path();
  const before = absolute.substring(0, props.match.start);
  const match = absolute.substring(props.match.start, props.match.end);
  const after = absolute.substring(props.match.end);
  return [before, match, after];
});

const open = () => {
  if (props.match.file.isDirectory()) {
    directoryStore.openfile(props.match.file);
  }
};
</script>

<template>
  <a draggable="false" :href="href" :target="target" @click="open">
    <i v-if="match.file.isDirectory()" class="bx bxs-folder"></i>
    <i v-else class="bx bx-file-blank"></i>
    <div class="details">
      <span class="name">
        <span>{{ filename[0] }}</span>
        <span class="match">{{ filename[1] }}</span>
        <span>{{ filename[2] }}</span>
      </span>
      <span>
        <span class="prefix">path:&nbsp;</span>
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
