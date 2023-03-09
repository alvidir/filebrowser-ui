<template>
  <dock-menu flex>
    <button class="no-hover no-tooltip">
      <img class="logo" :src="logoUri" />
    </button>
    <button v-for="app in apps" :key="app.name" @click="onClick(app)">
      <i :class="app.icon"></i>
      <label>{{ capitalize(app.name) }}</label>
    </button>
    <span></span>
    <button>
      <img
        class="fitted larger"
        src="https://assets.rawpixel.com/cover_png_400/Y29sbGVjdGlvbi9jb3Zlci9zY3JlZW5fc2hvdF8yMDE3LTA5LTE0X2F0XzMuMTQuMTBfcG0ucG5n.png?s=GkJuAnvHugH9-RJK6N_Y0MbIdONQw8fHcH4IS33-n_E"
        alt=""
      />
      <div class="tooltip">
        <span class="title">Username</span>
        <small>Something interesting</small>
      </div>
    </button>
  </dock-menu>
</template>

<script scoped lang="ts">
import { defineComponent } from "vue";
import App from "@/domain/app";

export default defineComponent({
  name: "SidenavMenu",

  props: {
    logoUri: {
      type: String,
      required: true,
    },
  },

  computed: {
    apps(): Array<App> {
      return App.all();
    },
  },

  methods: {
    capitalize(word: string) {
      return word[0].toUpperCase() + word.substring(1).toLowerCase();
    },

    onClick(app: App) {
      window.open(app.uri, "_blank")?.focus();
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
