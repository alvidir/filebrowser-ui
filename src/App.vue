<template>
  <h1>Hello world</h1>
</template>

<script lang="ts">
import { defineComponent } from "vue";

const THEME_LIGHT = "theme-light";
const THEME_DARK = "theme-dark";

export default defineComponent({
  name: "App",
  components: {},

  data() {
    return {
      theme: THEME_LIGHT,
    }
  },

  mounted() {
    const setLightTheme = () => {
      document.getElementsByTagName('body')[0].classList.add('theme-light')
      localStorage.setItem(process.env.VUE_APP_THEME_STORAGE_KEY, THEME_LIGHT)
      this.theme = THEME_LIGHT
    }

    const setDarkTheme = () => {
      document.getElementsByTagName('body')[0].classList.add('theme-dark')
      localStorage.setItem(process.env.VUE_APP_THEME_STORAGE_KEY, THEME_DARK)
      this.theme = THEME_DARK
    }

    var localTheme = localStorage.getItem(process.env.VUE_APP_THEME_STORAGE_KEY)
    if (localTheme === THEME_LIGHT) {
      setLightTheme()
    } else if (localTheme === THEME_DARK) {
      setDarkTheme()
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkTheme()
    } else {
      setLightTheme()
    }
  }
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
  height: 100vh;
}
</style>
