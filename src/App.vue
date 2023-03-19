<script setup lang="ts">
import { provide, reactive } from "vue";
import Profile from "vue-profile/src/profile";
import Filebrowser from "@/services/filebrowser";
import DirList from "@/components/DirList.vue";
import FileSearch from "@/components/FileSearch.vue";
import NewProject from "@/components/NewProject.vue";
import NewFolder from "@/components/NewFolder.vue";
import SidenavMenu from "@/components/SidenavMenu.vue";
import DirectoryController from "@/controllers/directory";
import WarningController from "@/controllers/warning";
import FilterController from "@/controllers/filter";
import SearchController from "@/controllers/search";
import config from "@/config.json";
import App from "@/domain/app";

const profile = new Profile();
profile.setDomain(config.ALVIDIR_BASE_URI);

const filebrowserService = new Filebrowser(
  config.FILEBROWSER_SERVER_URI,
  process.env.NODE_ENV === "development" ? { "X-Uid": "1" } : {}
);

const warningCtrl = reactive(new WarningController());
const filterCtrl = reactive(new FilterController());
const directoryCtrl = reactive(
  new DirectoryController(filebrowserService, warningCtrl)
);
const searchCtrl = reactive(
  new SearchController(filebrowserService, warningCtrl)
);

provide("profile", profile);
provide("searchCtrl", searchCtrl);
provide("directoryCtrl", directoryCtrl);
provide("filterCtrl", filterCtrl);
</script>

<template>
  <sidenav-menu :logo-uri="config.ALVIDIR_LOGO_URI"></sidenav-menu>
  <div id="main-container">
    <div class="narrowed">
      <notice-card
        v-for="(warning, index) in warningCtrl.all()"
        :key="index"
        v-bind="warning"
        @close="warningCtrl.remove(index)"
        closeable
      />
      <div id="actions-container">
        <file-search />
        <span id="action-buttons">
          <new-project class="action" :apps="App.all()"> </new-project>
          <new-folder class="action"></new-folder>
        </span>
      </div>
      <dir-list />
    </div>
  </div>
</template>

<style lang="scss">
@import "fibonacci-styles";

* {
  margin: 0;
  padding: 0;
  font-family: "Raleway", Helvetica, Arial, sans-serif;
}

body {
  background: var(--color-bg-secondary);
}

#main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: fit-content;
  width: 100%;
  min-width: $fib-11 * $fib-5 * 1px;

  .narrowed {
    box-sizing: border-box;
    width: $fib-13 * 3px;
    padding: 0 $fib-10 * 1px;
    margin-bottom: $fib-9 * 1px;
    margin-top: $fib-7 * 1px;
  }

  .notice-card:not(:first-child) {
    margin-top: $fib-5 * 1px;
  }
}

#actions-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $fib-11 * 1px 0;
  min-width: fit-content;
}

#action-buttons {
  display: flex;
  justify-content: center;
  margin-top: $fib-8 * 1px;
  white-space: nowrap;
  min-width: fit-content;

  & > :first-child {
    margin-right: $fib-5 * 1px;
  }
}

#app {
  display: flex;
  flex-direction: row;
  width: 100%;
}
</style>
