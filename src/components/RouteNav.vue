<template>
  <nav>
    <span v-for="(node, index) in nodes" :key="getLink(node)">
      <label>&nbsp;{{ PATH_SEPARATOR }}&nbsp;</label>
      <router-link :to="getLink(index)" @click="onPathChange(index)">
        {{ node }}
      </router-link>
    </span>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export const PATH_CHANGE_EVENT_NAME = "path-change";
const PATH_SEPARATOR = "/";

export default defineComponent({
  name: "RouteNav",
  events: [PATH_CHANGE_EVENT_NAME],
  props: {
    absolutePath: String,
    pathLinks: Object,
    pathSeparator: {
      type: String,
      default: PATH_SEPARATOR,
    },
  },

  setup() {
    return {
      PATH_SEPARATOR,
    };
  },

  computed: {
    nodes(): Array<string> {
      let path = this.absolutePath || window.location.pathname;
      if (path.length && path.charAt(0) == PATH_SEPARATOR) path = path.slice(1);
      return path.split(PATH_SEPARATOR);
    },
  },

  methods: {
    getAbsolutePath(index: number): string {
      return (
        PATH_SEPARATOR + this.nodes.slice(0, index + 1).join(PATH_SEPARATOR)
      );
    },

    getLink(index: number): string {
      const absolutePath = this.getAbsolutePath(index);
      return this.pathLinks ? this.pathLinks[absolutePath] : absolutePath;
    },

    onPathChange(index: number) {
      this.$emit(PATH_CHANGE_EVENT_NAME, this.getAbsolutePath(index));
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";
</style>
