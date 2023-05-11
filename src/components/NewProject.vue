<script setup lang="ts">
import { defineProps, ref } from "vue";
import { Tool } from "@/tool";
import ActionHeader from "@/components/ActionHeader.vue";
import ToolButton from "./ToolButton.vue";

interface Props {
  tools: Array<Tool>;
  pathname: string;
}

defineProps<Props>();

const active = ref(false);

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
          :href="pathname"
          icon="bx bxs-bulb"
        ></action-header>
      </template>
      <div class="tools">
        <tool-button
          v-for="tool in tools"
          :key="tool.name"
          :tool="tool"
          :pathname="pathname"
        ></tool-button>
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
