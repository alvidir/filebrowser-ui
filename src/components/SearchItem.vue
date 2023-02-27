<template>
  <div class="search-item">
    <i class="bx bx-file-blank"></i>
    <label>{{ file.filename() }}</label>
  </div>
</template>

<script scoped lang="ts">
import { defineComponent, PropType } from "vue";
import FileData from "@/domain/file";

export default defineComponent({
  name: "SearchItem",
  props: {
    file: {
      type: Object as PropType<FileData>,
      required: true,
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

.column {
  display: flex;
  flex-direction: column;
}

.title {
  display: flex;
  justify-content: left;
  font-weight: 600;
}

.regular-menu.tooltip {
  padding: 0px !important;
}

.icon {
  box-sizing: border-box;
  padding: 4px;
}
</style>
