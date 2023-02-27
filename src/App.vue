<template>
  <sidenav-menu :on-click="() => context.switchTheme()"></sidenav-menu>
  <div id="main-container">
    <div class="narrowed">
      <notice-card
        v-for="(warning, index) in warningCtrl.getWarnings()"
        :key="index"
        v-bind="warning"
        @close="warningCtrl.removeWarningAt(index)"
        closable
      />
      <div id="actions-container">
        <search-field
          id="search-field"
          :placeholder="'Search'"
          :items="searchCtrl.getItems()"
          :debounce="searchCtrl.getDebounce()"
          @input="searchCtrl.search"
          v-slot="props"
          large
        >
          <search-item
            :file="props.item"
            @openfile="directoryCtrl.openfile"
          ></search-item>
        </search-field>
        <span id="action-buttons">
          <new-project
            class="action"
            :path="directoryCtrl.getPath()"
            :tools="apps"
            @submit="onNewProject"
          >
          </new-project>
          <new-folder
            class="action"
            :path="directoryCtrl.getPath()"
            :href="directoryCtrl.getDirectory()?.path"
            @submit="createNewFolder"
          ></new-folder>
        </span>
      </div>
      <dir-list
        :files="files"
        :path="directoryCtrl.getPath()"
        @openfile="directoryCtrl.openfile"
        @changedir="directoryCtrl.changeDirectory"
        @relocate="directoryCtrl.relocate"
        @rename="directoryCtrl.rename"
        @delete="onDelete"
      />
    </div>
    <confirm-deletion
      :context="subject"
      @submit="applyDelete"
      @cancel="closeDelete"
    >
    </confirm-deletion>
  </div>
</template>

<script lang="ts">
import { defineComponent, provide } from "vue";
import Context from "fibonacci-styles/context";
import Filebrowser from "@/services/filebrowser";
import DirList from "@/components/DirList.vue";
import SearchItem from "@/components/SearchItem.vue";
import FileData from "@/domain/file";
import NewProject from "@/components/NewProject.vue";
import NewFolder from "@/components/NewFolder.vue";
import ConfirmDeletion from "@/components/ConfirmDeletion.vue";
import SidenavMenu from "@/components/SidenavMenu.vue";
import DirectoryController from "@/controllers/directory";
import WarningController from "@/controllers/warning";
import FilterController from "@/controllers/filter";
import SearchController from "@/controllers/search";
import * as constants from "@/constants";
import config from "@/config.json";
import Warning from "@/domain/warning";

// baseHeaders returns a dictionary with some default values depending on the environment
function baseHeaders(): { [key: string]: string } {
  const headers: { [key: string]: string } = {};
  if (process.env.NODE_ENV === "development") {
    headers["X-Uid"] = "1";
  }

  return headers;
}

const context = new Context(config.ALVIDIR_BASE_URI);
const filebrowserService = new Filebrowser(
  config.FILEBROWSER_SERVER_URI,
  baseHeaders()
);

const warningCtrl = new WarningController();
const filterCtrl = new FilterController();
const directoryCtrl = new DirectoryController(filebrowserService, warningCtrl);
const searchCtrl = new SearchController(filebrowserService, warningCtrl);

export default defineComponent({
  name: "App",
  components: {
    DirList,
    NewProject,
    NewFolder,
    ConfirmDeletion,
    SidenavMenu,
    SearchItem,
  },

  setup() {
    provide("context", context);
    provide("directoryCtrl", directoryCtrl);

    return {
      context,
      searchCtrl,
      warningCtrl,
      directoryCtrl,
      filterCtrl,
      constants,
    };
  },

  data() {
    return {
      updatedAt: new Date(),
      files: [] as Array<FileData>,
      subject: undefined as FileData | undefined,
    };
  },

  methods: {
    update() {
      this.updatedAt = new Date();
      this.files = this.filterCtrl.filter(
        this.directoryCtrl.getDirectory()?.files ?? []
      );
    },

    onDelete(file: FileData) {
      this.subject = file;
    },

    applyDelete() {
      const file = this.subject;
      this.closeDelete();

      if (file) {
        directoryCtrl.delete(file);
      }
    },

    closeDelete() {
      this.subject = undefined;
    },
  },

  mounted() {
    this.searchCtrl.addObserver(this);
    this.warningCtrl.addObserver(this);
    this.directoryCtrl.addObserver(this);

    this.directoryCtrl.setPath(
      window.location.pathname ?? constants.pathSeparator
    );

    window.onpopstate = () => {
      this.directoryCtrl.setPath(window.location.pathname);
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
