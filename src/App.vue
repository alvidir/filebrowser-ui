<script setup lang="ts">
import { ref, watch, onBeforeMount } from "vue";
import { getProfile } from "@/services/filebrowser.rest";
import { useWarningStore } from "@/stores/warning";
import { Code, getWarning } from "./warning";
import { tools } from "@/tool";
import { File, getPath, getUrl, isDirectory } from "./file";
import { useFileStore } from "./stores/file";
import { Warning } from "@/warning";
import { Profile, loadAndApply } from "vue-profile/src/profile";
import WarningList from "@/components/WarningList.vue";
import DirList from "@/components/DirList.vue";
import FileSearch from "@/components/FileSearch.vue";
import NewProject from "@/components/NewProject.vue";
import NewFolder from "@/components/NewFolder.vue";
import SidenavMenu from "@/components/SidenavMenu.vue";
import config from "@/config.json";
import * as rpc from "@/services/filebrowser.rpc";
import * as path from "@/path";

const fileStore = useFileStore();
const warningStore = useWarningStore();

const profile = ref<Profile>(loadAndApply());
const fetching = ref(false);

getProfile()
  .then((data) => {
    Object.assign(profile.value, data);
  })
  .catch(() => {
    warningStore.push(getWarning(Code.ErrFetchingProfile));
  });

const pathname = ref(window.location.pathname);

const setPathname = (dest: string) => {
  pathname.value = path.sanatize(dest);
  window.history.pushState("", "", pathname.value);
};

const open = (file: File) => {
  if (isDirectory(file)) setPathname(getPath(file));
  else window.open(getUrl(file), "_blank");
};

const fetchDirectory = (dir: string) => {
  if (fileStore.getDirectory(dir).length) return;
  fetching.value = true;

  rpc
    .getDirectory(dir)
    .then((files: Array<File>) => {
      files.forEach((file) => fileStore.addFile(file));
    })
    .catch((error: Warning) => {
      warningStore.push(error);
    })
    .finally(() => {
      fetching.value = false;
    });
};

const onPathnameChange = (newValue: string, oldValue: string) => {
  fetchDirectory(newValue);

  fileStore.getDirectory(oldValue)?.forEach((fileId) => {
    const file = fileStore.getFile(fileId);
    if (file) file.isNew = false;
  });
};

watch(pathname, onPathnameChange);
onBeforeMount(() => fetchDirectory(pathname.value));
</script>

<template>
  <sidenav-menu
    :logo="config.ALVIDIR_LOGO_URI"
    :tools="tools"
    :profile="profile"
  ></sidenav-menu>
  <warning-list></warning-list>
  <div id="main">
    <div id="actions">
      <file-search @open="open" />
      <span id="action-buttons">
        <new-project :tools="tools" :pathname="pathname" class="action">
        </new-project>
        <new-folder :pathname="pathname" class="action"> </new-folder>
      </span>
    </div>
    <dir-list :pathname="pathname" @open="open" @change-dir="setPathname" />
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
