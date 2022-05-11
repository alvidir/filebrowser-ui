<template>
  <router-nav absolute-path="/hello/world" />
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import RouterNav from "@/components/RouteNav.vue";
import {
  THEME_LIGHT,
  THEME_DARK,
  GetDefaultTheme,
  SwitchTheme,
} from "fibonacci-styles/util";

export default defineComponent({
  name: "App",
  components: {
    RouterNav,
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
</style>
