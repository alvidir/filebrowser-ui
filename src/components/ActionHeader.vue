<script setup lang="ts">
import { defineProps, computed } from "vue";
import * as path from "@/path";

interface Props {
  title: string;
  color?: string;
  subtitle: string;
  pathname: string;
  href: string;
  icon: string;
}

const props = defineProps<Props>();

const maxPathnameLen = 34;
const shortenedPathname = computed((): string | undefined => {
  const pathname = path.display(props.pathname);
  if (!pathname || pathname.length <= maxPathnameLen) {
    return pathname;
  }

  const short = props.pathname.slice(-maxPathnameLen);
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
    <a :href="href" target="_blank">{{ shortenedPathname }}</a>
  </small>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

i {
  color: var(--color-text-secondary);
}

.title {
  color: v-bind(color);
}
</style>
