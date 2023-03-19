<script setup lang="ts">
import { defineProps, computed } from "vue";
import { maxFilenameLen } from "@/domain/file";

interface Props {
  title?: string;
  titleColor?: string;
  subtitle?: string;
  path?: string;
  href?: string;
  icon?: string;
}

const props = defineProps<Props>();
const adjustedPath = computed((): string | undefined => {
  if (!props.path || props.path.length <= maxFilenameLen) {
    return props.path;
  }

  const short = props.path.slice(-maxFilenameLen);
  return `\u2026${short}`;
});
</script>

<template>
  <span class="title">
    <i :class="icon"></i>&nbsp;
    {{ title }}
  </span>
  <small v-if="subtitle" class="subtitle">
    {{ subtitle }}
    <a :href="href" target="_blank">{{ adjustedPath }}</a>
  </small>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

i {
  color: var(--color-text-secondary);
}

.title {
  color: v-bind(titleColor);
}
</style>
