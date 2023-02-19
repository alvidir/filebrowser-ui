<template>
  <sidenav-menu :on-click="() => context.switchTheme()"></sidenav-menu>
  <div id="main-container">
    <div class="narrowed">
      <notice-card
        v-for="(warning, index) in warningCtrl.getWarnings()"
        v-key="index"
        v-bind="warning"
        @close="warningCtrl.removeWarning(warning)"
      />
      <!-- <div id="actions-container">
        <search-field
          id="search-field"
          :placeholder="'Search'"
          :items="search"
          :debounce="SEARCH_DEBOUNCE"
          @input="onSearchInput"
          v-slot="props"
          large
        >
          <div class="search-item">
            <i class="bx bx-file-blank"></i>
            <label>{{ props.item.name }}</label>
          </div>
        </search-field>
        <span id="action-buttons">
          <new-project
            class="action"
            :path="path"
            :tools="apps"
            @submit="onNewProject"
          >
          </new-project>
          <new-folder
            class="action"
            :path="path"
            :validate="getNameError"
            @submit="createNewFolder"
          ></new-folder>
        </span>
      </div> -->
      <dir-list
        :files="filteredFiles"
        :path="path"
        :validate="getNameError"
        @openfile="onOpenfile"
        @changedir="onChangeDirectory"
        @relocate="onRelocate"
        @delete="onDelete"
      />
    </div>
    <!-- <action-dialog
      v-if="dialog"
      :path="dialog.path"
      :action="dialog.action"
      :context="dialog.context"
      :active="!!dialog.context"
      @submit="onCloseDialog(true)"
      @cancel="onCloseDialog(false)"
    >
    </action-dialog> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, provide } from "vue";
import Context from "fibonacci-styles/context";
import Filebrowser from "@/services/filebrowser";
import DirList from "@/components/DirList.vue";
import NewProject from "@/components/NewProject.vue";
import NewFolder from "@/components/NewFolder.vue";
import ActionDialog from "@/components/DeletionDialog.vue";
import SidenavMenu from "@/components/SidenavMenu.vue";
import DirectoryController from "@/controllers/directory";
import WarningController from "@/controllers/warning";
import * as constants from "@/constants";
import config from "@/config.json";

const ROOT_PATH = constants.PATH_SEPARATOR;

const filebrowserService = new Filebrowser(config.FILEBROWSER_SERVER_URI);
const warningCtrl = new WarningController();
const directoriesCtrl = new DirectoryController(
  filebrowserService,
  warningCtrl
);

export default defineComponent({
  name: "App",
  components: {
    DirList,
    NewProject,
    NewFolder,
    ActionDialog,
    SidenavMenu,
  },

  setup() {
    const context = new Context(config.ALVIDIR_BASE_URI);

    provide("context", context);
    provide("warningCtrl", warningCtrl);
    provide("directoriesCtrl", directoriesCtrl);

    return {
      context,
      warningCtrl,
      directoriesCtrl,
      constants,
    };
  },

  data() {
    return {
      path: window.location.pathname ?? ROOT_PATH,
    };
  },

  watch: {
    path(path: string) {
      const current = window.location.pathname;
      if (path != current) {
        window.history.pushState("", "", path);
      }
    },
  },

  mounted() {
    window.onpopstate = () => {
      this.path = window.location.pathname ?? ROOT_PATH;
    };
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
  background: var(--color-bg-secondary);
}

// .search-item {
//   font-size: medium;
//   margin-left: $fib-5 * 1px;
//   color: var(--color-text-primary);

//   i {
//     margin-right: $fib-6 * 1px;
//   }
// }

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
}

#actions-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $fib-11 * 1px 0;
  min-width: fit-content;
}

#search-field {
  width: $fib-14 * 1px;
  z-index: 1;
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
