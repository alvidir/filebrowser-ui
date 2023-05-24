<script setup lang="ts">
import urlJoin from "url-join";
import { Profile } from "vue-profile/src/profile";
import config from "@/config.json";
import { Tool } from "@/tool";

interface Props {
  logo: string;
  tools: Array<Tool>;
  profile: Profile;
}

defineProps<Props>();

const capitalize = (word: string) => {
  return word[0].toUpperCase() + word.substring(1).toLowerCase();
};

const onAppClick = (tool: Tool) => {
  window.open(tool.uri, "_blank")?.focus();
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
    <button v-for="tool in tools" :key="tool.name" @click="onAppClick(tool)">
      <i :class="tool.icon"></i>
      <label>{{ capitalize(tool.name) }}</label>
    </button>
    <span></span>
    <div class="item">
      <img
        v-if="profile.picture"
        class="fitted larger"
        :src="profile.picture"
        :alt="profile.name"
      />
      <i v-else class="fallback-avatar bx bx-user"></i>
      <profile-menu
        class="tooltip bottom delayed"
        :profile="profile"
        @signout="onSignoutClick"
        @signup="onSignupClick"
      />
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
