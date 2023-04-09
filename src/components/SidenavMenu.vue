<script setup lang="ts">
import urlJoin from "url-join";
import { defineProps } from "vue";
import Profile from "vue-menus/src/profile";
import config from "@/config.json";

interface App {
  name: string;
  icon: string;
  uri: string;
}

interface Props {
  logo: string;
  apps: Array<App>;
  profile: Profile;
}

defineProps<Props>();

const capitalize = (word: string) => {
  return word[0].toUpperCase() + word.substring(1).toLowerCase();
};

const onAppClick = (app: App) => {
  window.open(app.uri, "_blank")?.focus();
};

const onSignoutClick = () => {
  window.location.assign(urlJoin(config.AUTH_BASE_URI, "logout"));
};

const onSignupClick = () => {
  window.location.assign(urlJoin(config.AUTH_BASE_URI, "signup"));
};
</script>

<template>
  <dock-menu flex>
    <button class="no-hover no-tooltip">
      <img class="logo" :src="logo" />
    </button>
    <button v-for="app in apps" :key="app.name" @click="onAppClick(app)">
      <i :class="app.icon"></i>
      <label>{{ capitalize(app.name) }}</label>
    </button>
    <span></span>
    <div class="item">
      <img
        v-if="profile.picture"
        class="fitted larger"
        :src="profile.picture"
        alt=""
      />
      <i v-else class="fallback-avatar bx bx-user"></i>
      <profile-menu
        class="tooltip bottom delayed"
        v-bind="profile"
        @signout="onSignoutClick"
        @signup="onSignupClick"
      ></profile-menu>
    </div>
  </dock-menu>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

.regular-menu.tooltip {
  padding: 0px !important;
}

.fallback-avatar {
  font-size: x-large !important;
}
</style>
