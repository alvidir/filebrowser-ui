<script setup lang="ts">
import { defineProps } from "vue";

interface App {
  name: string;
  icon: string;
  uri: string;
}

interface Props {
  logo: string;
  apps: Array<App>;
}

defineProps<Props>();

const capitalize = (word: string) => {
  return word[0].toUpperCase() + word.substring(1).toLowerCase();
};

const onClick = (app: App) => {
  window.open(app.uri, "_blank")?.focus();
};
</script>

<template>
  <dock-menu flex>
    <button class="no-hover no-tooltip">
      <img class="logo" :src="logo" />
    </button>
    <button v-for="app in apps" :key="app.name" @click="onClick(app)">
      <i :class="app.icon"></i>
      <label>{{ capitalize(app.name) }}</label>
    </button>
    <span></span>
    <div class="item">
      <img
        class="fitted larger"
        src="https://assets.rawpixel.com/cover_png_400/Y29sbGVjdGlvbi9jb3Zlci9zY3JlZW5fc2hvdF8yMDE3LTA5LTE0X2F0XzMuMTQuMTBfcG0ucG5n.png?s=GkJuAnvHugH9-RJK6N_Y0MbIdONQw8fHcH4IS33-n_E"
        alt=""
      />
      <profile-menu class="tooltip bottom delayed"></profile-menu>
    </div>
  </dock-menu>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

.regular-menu.tooltip {
  padding: 0px !important;
}
</style>
