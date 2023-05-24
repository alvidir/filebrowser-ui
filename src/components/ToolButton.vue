<script setup lang="ts">
import { ref, computed } from "vue";
import PulseLoader from "vue-spinner/src/PulseLoader.vue";
import * as rpc from "@/services/filebrowser.rpc";
import { Tool } from "@/tool";
import { File, getUrl } from "@/file";
import { Warning } from "@/warning";
import { useWarningStore } from "@/stores/warning";
import { useFileStore } from "@/stores/file";

const defaultProjectName = "Untitled project";

const fileStore = useFileStore();
const warningStore = useWarningStore();

interface Props {
  tool: Tool;
  pathname: string;
}

const props = defineProps<Props>();

const fetching = ref(false);

const title = computed((): string => {
  return (
    props.tool.name[0].toUpperCase() +
    props.tool.name.substring(1).toLowerCase()
  );
});

const onClick = () => {
  fetching.value = true;

  rpc
    .createFile({
      id: "",
      name: defaultProjectName,
      directory: props.pathname,
      metadata: new Map(),
      permissions: new Map(),
      flags: 0,
      isNew: true,
    })
    .then((file: File) => {
      fileStore.addFile(file);
      window.open(getUrl(file), "_blank");
    })
    .catch((error: Warning) => {
      warningStore.push(error);
    })
    .finally(() => {
      fetching.value = false;
    });
};
</script>

<template>
  <button :key="tool.name" :disabled="fetching" class="tool" @click="onClick">
    <pulse-loader
      v-if="fetching"
      class="loader"
      color="var(--color-border-active)"
      :size="'8px'"
      :radius="'5px'"
    ></pulse-loader>
    <i v-else :class="tool.icon" :alt="tool.name"></i>
    <span>{{ title }}</span>
  </button>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

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
</style>
