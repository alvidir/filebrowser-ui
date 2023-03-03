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

<script scoped lang="ts">
import { defineComponent } from "vue";
import { maxFilenameLen } from "@/domain/file";

export default defineComponent({
  name: "ActionHeader",
  props: {
    title: String,
    titleColor: String,
    subtitle: String,
    path: String,
    href: String,
    icon: String,
  },

  computed: {
    adjustedPath(): string | undefined {
      if (!this.path || this.path.length <= maxFilenameLen) {
        return this.path;
      }

      const short = this.path.slice(-maxFilenameLen);
      return `\u2026${short}`;
    },
  },
});
</script>

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
