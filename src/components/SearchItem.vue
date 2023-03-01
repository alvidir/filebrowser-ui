<template>
  <div class="search-item">
    <i class="bx bx-file-blank"></i>
    <label>{{ file.name }}</label>
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
</style>
