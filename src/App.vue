<template>
  <dir-list :files="files" path="path/to/directory"></dir-list>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Filebrowser from "@/filebrowser.service";
import { Error, Directory } from "@/model";
import DirList from "@/components/DirList.vue";
import { GetDefaultTheme } from "fibonacci-styles/util";

const FilebrowserService = new Filebrowser(process.env.VUE_APP_FILEBROWSER_URI);

export default defineComponent({
  name: "App",
  components: {
    DirList,
  },

  data() {
    return {
      files: [
        { name: "second file", isDir: false, updatedAt: Date.now() },
        { name: "first file", isDir: false, updatedAt: Date.now() },
        {
          name: "third file",
          isDir: false,
          updatedAt: Date.now(),
          tags: ["first tag", "second tag"],
        },
        {
          name: "first folder",
          isDir: true,
          updatedAt: Date.now(),
          size: { value: 3, unit: "items" },
          tags: ["another tag"],
        },
        {
          name: "second folder",
          isDir: true,
          updatedAt: Date.now(),
          size: { value: 10, unit: "items" },
        },
      ],
    };
  },

  methods: {},

  mounted() {
    GetDefaultTheme(process.env.VUE_APP_THEME_STORAGE_KEY);
    FilebrowserService.getDirectory()
      .then((dir: Directory) => console.log("got directory: ", dir))
      .catch((err: Error) => console.log("got error: ", err))
      .finally(() => console.log("done."));
  },
});
</script>

<style lang="scss">
@import "fibonacci-styles";

* {
  margin: 0;
  padding: 0;
  font-family: "Raleway", Helvetica, Arial, sans-serif;
}

body {
  min-height: 100vh;
  width: 100%;
  background: var(--color-background-secondary);
}

.centered-column {
  display: flex;
  align-items: center;
  flex-direction: column;
}

#app {
  @extend .centered-column;
  @extend .theme-dark;
  height: 100vh;
}
</style>
