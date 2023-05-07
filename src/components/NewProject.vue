<script setup lang="ts">
import { defineProps, ref, reactive, computed } from "vue";
import PulseLoader from "vue-spinner/src/PulseLoader.vue";
import { Tool } from "@/tool";
import { File } from "@/file";
import * as path from "@/path";
import ActionHeader from "@/components/ActionHeader.vue";

interface Props {
  tools: Array<Tool>;
  pathname: string;
}

const props = defineProps<Props>();

const active = ref(false);
const pending = reactive(new Array<File>());

const href = computed((): string => {
  return path.sanatize(props.pathname);
});

const capitalize = (word: string) => {
  return word[0].toUpperCase() + word.substring(1).toLowerCase();
};

const isPending = (tool: Tool) => {
  return pending.some((file) => {
    return file.tool() == tool;
  });
};

const onClick = (tool: Tool) => {
  if (!directoryStore) return;

  const file = new FileData("", "", directoryStore.path);
  file.setTool(tool);

  const index = pending.push(file);
  directoryStore.createFile(file)?.then(() => {
    pending.splice(index - 1, 1);
    directoryStore.openfile(file);
  });
};

const open = () => {
  active.value = true;
};

const close = () => {
  active.value = false;
};
</script>

<template>
  <div class="new-project-dialog" v-click-outside="close">
    <submit-button color="var(--color-accent)" @click="open">
      <i class="bx bxs-bulb"></i>
      New project
    </submit-button>
    <regular-card :class="{ active: active }" @close="close" closable>
      <template #header>
        <action-header
          title="Start building your new project"
          title-color="var(--color-accent)"
          subtitle="It will be created at"
          :pathname="pathname"
          :href="href"
          icon="bx bxs-bulb"
        ></action-header>
      </template>
      <div class="tools">
        <button
          v-for="tool in tools"
          :key="tool.name"
          :disabled="isPending(tool)"
          class="tool"
          @click="onClick(tool)"
        >
          <i v-if="!isPending(tool)" :class="tool.icon" :alt="tool.name"></i>
          <pulse-loader
            v-if="isPending(tool)"
            class="loader"
            color="var(--color-border-active)"
            :size="'8px'"
            :radius="'5px'"
          ></pulse-loader>
          <span>{{ capitalize(tool.name) }}</span>
        </button>
      </div>
    </regular-card>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

.new-project-dialog {
  position: relative;

  .tools {
    display: grid;
    position: relative;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: $fib-6 * 1px;
  }

  button.tool {
    @extend .round-corners;

    display: flex;
    flex-direction: column;
    justify-content: center;
    color: var(--color-text-primary);
    aspect-ratio: 1;
    background: transparent;

    &:not(:hover) {
      border: none;
    }

    &:hover {
      border: 1px solid var(--color-border);
    }

    &:active,
    &.off {
      border: 1px solid var(--color-border-active);
    }

    & > .loader {
      display: flex;
      justify-content: center;
      align-items: center;
      height: $fib-8 * 1px;
    }

    i {
      font-size: $fib-8 * 1px;
    }

    span {
      margin-top: $fib-6 * 1px;
    }
  }

  .regular-card {
    @extend .shadow-box;

    position: absolute;
    margin-top: $fib-5 * 1px;
    min-width: $fib-13 * 1px;
    visibility: hidden;
    border-color: var(--color-accent);

    &.active {
      visibility: visible;
    }
  }
}
</style>
