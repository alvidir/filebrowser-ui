<script setup lang="ts">
import { provide, ref } from "vue";
import Profile from "vue-menus/src/profile";
import FilebrowserRpc from "@/services/filebrowser.rpc";
import FilebrowserRest from "@/services/filebrowser.rest";
import WarningList from "@/components/WarningList.vue";
import Warning, { Error } from "@/domain/warning";
import { useWarningStore } from "@/stores/warning";
import DirList from "@/components/DirList.vue";
import FileSearch from "@/components/FileSearch.vue";
import NewProject from "@/components/NewProject.vue";
import NewFolder from "@/components/NewFolder.vue";
import SidenavMenu from "@/components/SidenavMenu.vue";
import config from "@/config.json";
import App from "@/domain/app";
import urlJoin from "url-join";

const development = process.env.NODE_ENV === "development";

const headers: { [key: string]: string } = development ? { "X-Uid": "1" } : {};

const rpcUrl = development
  ? config.FILEBROWSER_BASE_URI
  : urlJoin(config.FILEBROWSER_BASE_URI, "rpc");

const restUrl = development
  ? config.FILEBROWSER_BASE_URI
  : urlJoin(config.FILEBROWSER_BASE_URI, "rest");

const filebrowserRpcClient = new FilebrowserRpc(rpcUrl, headers);
provide("filebrowserClient", filebrowserRpcClient);

const profile = ref<Profile>(new Profile("", ""));
const filebrowserRestClient = new FilebrowserRest(restUrl, headers);
filebrowserRestClient
  .getProfile()
  .then((data) => {
    profile.value = data;
  })
  .catch(() => {
    const warningStore = useWarningStore();
    warningStore.push(Warning.find(Error.ErrFetchingProfile));
  });
</script>

<template>
  <sidenav-menu
    :logo="config.ALVIDIR_LOGO_URI"
    :apps="App.all()"
    :profile="profile"
  ></sidenav-menu>
  <warning-list></warning-list>
  <div id="main">
    <div id="actions">
      <file-search />
      <span id="action-buttons">
        <new-project class="action" :apps="App.all()"> </new-project>
        <new-folder class="action"></new-folder>
      </span>
    </div>
    <dir-list />
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

#app {
  display: flex;
  flex-direction: row;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: fit-content;
  width: 100%;
  min-width: $fib-11 * $fib-5 * 1px;
}

#main {
  box-sizing: border-box;
  width: $fib-13 * 3px;
  padding: 0 $fib-10 * 1px;
  margin-bottom: $fib-9 * 1px;
  margin-top: $fib-7 * 1px;
}

#actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $fib-11 * 1px 0;
  min-width: fit-content;

  & > span {
    display: flex;
    justify-content: center;
    margin-top: $fib-8 * 1px;
    white-space: nowrap;
    min-width: fit-content;

    & > :first-child {
      margin-right: $fib-5 * 1px;
    }
  }
}
</style>
