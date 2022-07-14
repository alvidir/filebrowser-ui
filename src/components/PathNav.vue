<template>
  <span class="path-nav">
    <span v-for="(node, index) in nodes" :key="getAbsolutePath(node)">
      <label class="path-separator">&nbsp;{{ PATH_SEPARATOR }}&nbsp;</label>
      <button @click="onPathClick(index)">
        {{ node }}
      </button>
    </span>
  </span>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export const CLICK_EVENT_NAME = "click";
const PATH_SEPARATOR = "/";

export default defineComponent({
  name: "PathNav",
  events: [CLICK_EVENT_NAME],
  props: {
    absolutePath: String,
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

    onPathClick(index: number) {
      this.$emit(CLICK_EVENT_NAME, this.getAbsolutePath(index));
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

.path-nav {
  $font-size: $fib-7 * 1px;

  button {
    cursor: pointer;
    font-size: $font-size;
    background: transparent;
    outline: none;
    border: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .path-separator {
    font-size: $font-size;
    opacity: 70%;
  }
}
</style>
