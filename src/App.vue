<template>
  <!-- <dock id="sidenav" :active="true" :position="'left'">
    <dock-item id="0" placeholder="first item"><label>Aa</label></dock-item>
    <dock-item id="1" placeholder="second item"><label>Bb</label></dock-item>
    <dock-item id="2" placeholder="third item"><label>Cc</label></dock-item>
    <dock-item id="3" placeholder="fourth item"><label>Dd</label></dock-item>
    <dock-item id="4" placeholder="fifth item"><label>Ee</label></dock-item>
    <dock-item id="5" placeholder="sixth item"><label>Ff</label></dock-item>
    <dock-separator></dock-separator>
    <dock-item id="6" placeholder="seventh item"><label>Gg</label></dock-item>
  </dock> -->
  <div id="main-container">
    <div class="narrowed">
      <notice-card v-if="warning" v-bind="warning" @close="quitWarning()" />
      <div id="actions-container">
        <search-field id="search-field" :placeholder="'Search'" large />
        <span id="action-buttons">
          <submit-button>
            <i class="bx bxs-bulb"></i>
            {{ NEW_DIRECTORY }}
          </submit-button>
          <regular-button>
            <i class="bx bxs-file-plus"></i>
            {{ NEW_FILE }}
          </regular-button>
          <regular-button>
            <i class="bx bxs-folder-plus"></i>
            {{ NEW_FOLDER }}
          </regular-button>
        </span>
      </div>
      <dir-list :files="files" :path="path" @click="onRowClick" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Filebrowser, { Flags, Error } from "@/filebrowser.service";
import DirList, { File } from "@/components/DirList.vue";
import { THEME_LIGHT, GetDefaultTheme } from "fibonacci-styles/util";
import * as constants from "@/constants";
import * as cookies from "@/cookies.manager";

const filebrowserService = new Filebrowser(
  process.env.VUE_APP_FILEBROWSER_URI ?? "http://localhost:8080"
);

const NEW_DIRECTORY = "New directory";
const NEW_FILE = "New file";
const NEW_FOLDER = "New folder";
const ROOT_PATH = constants.PATH_SEPARATOR;
const PATH_REPLACE = new RegExp(constants.PATH_SEPARATOR + "{1,}", "g");

export default defineComponent({
  name: "App",
  components: {
    DirList,
  },

  setup() {
    const SESSION_TOKEN = cookies.getCookie(
      process.env.VUE_APP_TOKEN_COOKIE_KEY
    );

    return {
      NEW_DIRECTORY,
      NEW_FILE,
      NEW_FOLDER,
      SESSION_TOKEN,
    };
  },

  data() {
    return {
      theme: THEME_LIGHT,
      warning: undefined as constants.WarningProp | undefined,
      path: ROOT_PATH,
      dirs: {} as { [dir: string]: File[] },
    };
  },

  computed: {
    files(): File[] {
      const target = this.path;
      if (!this.dirs[target]) {
        this.pullDirectoryFiles(target);
      }

      return this.dirs[target];
    },
  },

  methods: {
    onRowClick(file: File) {
      if (file.isDir) {
        this.path = [this.path, file.name]
          .join(constants.PATH_SEPARATOR)
          .replace(PATH_REPLACE, constants.PATH_SEPARATOR);
      }
    },

    onResponseError(error: Error): void {
      this.warning = constants.WARNING_PROPS[error];
      if (this.warning) return;

      this.warning = constants.WARNING_PROPS[Error.ERR_UNKNOWN];
      if (this.warning) this.warning.text = error;
    },

    quitWarning() {
      this.warning = undefined;
    },

    pullDirectoryFiles(target: string) {
      const headers: { [key: string]: string } = {};
      if (process.env.VUE_APP_TOKEN_COOKIE_KEY && this.SESSION_TOKEN) {
        headers[process.env.VUE_APP_TOKEN_COOKIE_KEY] = this.SESSION_TOKEN;
      }

      headers["x-uid"] = "1";

      filebrowserService
        .getDirectory(target, headers)
        .then((dir) => {
          this.dirs[target] = Object.values(dir.files).map((file) => {
            return {
              name: file.name,
              isDir: (file.flags & Flags.Directory) != 0,
              updatedAt: 0,
            };
          });
        })
        .catch((error) => this.onResponseError(error));
    },
  },

  mounted() {
    this.theme = GetDefaultTheme(process.env.VUE_APP_THEME_STORAGE_KEY);
  },
});
</script>

<style lang="scss">
@import "fibonacci-styles";

* {
  @extend .theme-dark;
  margin: 0;
  padding: 0;
  font-family: "Raleway", Helvetica, Arial, sans-serif;
}

body {
  background: var(--color-background-secondary);
}

#sidenav {
  z-index: 2;
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
    padding: 0 $fib-9 * 1px;
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

  button {
    &:not(:first-child) {
      margin-left: $fib-5 * 1px;

      i {
        font-size: $fib-7 * 1px;
        color: var(--color-secondary-text);
        padding-right: $fib-6 * 1px;
      }
    }

    &.submit {
      background: var(--color-accent);
      border: none;
    }
  }
}

#app {
  display: flex;
  flex-direction: row;
  width: 100%;
}
</style>
