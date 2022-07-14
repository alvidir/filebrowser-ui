<template>
  <div class="topbar">
    <path-nav absolute-path="/hello/world"></path-nav>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Filebrowser from "@/filebrowser.service";
import { Error, Directory } from "@/model";
import PathNav from "@/components/PathNav.vue";
import {
  THEME_LIGHT,
  THEME_DARK,
  GetDefaultTheme,
  SwitchTheme,
} from "fibonacci-styles/util";

const FilebrowserService = new Filebrowser(process.env.VUE_APP_FILEBROWSER_URI);

export default defineComponent({
  name: "App",
  components: {
    PathNav,
  },

  setup() {
    return {
      THEME_LIGHT,
      THEME_DARK,
    };
  },

  data() {
    return {
      theme: THEME_LIGHT,
      directory: undefined,
    };
  },

  methods: {
    onSwitchTheme() {
      this.theme = SwitchTheme(
        this.theme,
        process.env.VUE_APP_THEME_STORAGE_KEY
      );
    },
  },

  mounted() {
    this.theme = GetDefaultTheme(process.env.VUE_APP_THEME_STORAGE_KEY);
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
  height: 100vh;
}

.top-bar {
}
</style>
