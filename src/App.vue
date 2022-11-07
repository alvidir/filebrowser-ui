<template>
  <div id="main-container">
    <div class="narrowed">
      <notice-card v-if="warning" v-bind="warning" @close="quitWarning()" />
      <div id="actions-container">
        <search-field
          id="search-field"
          :placeholder="'Search'"
          :items="search"
          :debounce="SEARCH_DEBOUNCE"
          @input="onSearchInput"
          v-slot="props"
          large
        >
          <label class="search-item">{{ props.item.name }}</label>
        </search-field>
        <span id="action-buttons">
          <submit-button>
            <i class="bx bxs-bulb"></i>
            {{ NEW_PROJECT }}
          </submit-button>
          <regular-button disabled>
            <i class="bx bxs-folder-plus"></i>
            {{ NEW_FOLDER }}
          </regular-button>
          <regular-button disabled>
            <i class="bx bxs-file-plus"></i>
            {{ NEW_FILE }}
          </regular-button>
        </span>
      </div>
      <dir-list
        :files="files"
        :path="path"
        @click="onRowClick"
        @navigate="onChangeDirectory"
      />
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

const NEW_PROJECT = "New project";
const NEW_FILE = "New file";
const NEW_FOLDER = "New folder";
const ROOT_PATH = constants.PATH_SEPARATOR;
const PATH_REPLACE_REGEX = new RegExp(constants.PATH_SEPARATOR + "{1,}", "g");
const METADATA_UPDATED_AT_KEY = "updated_at";
const SEARCH_DEBOUNCE = 300;

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
      NEW_PROJECT,
      NEW_FILE,
      NEW_FOLDER,
      SESSION_TOKEN,
      SEARCH_DEBOUNCE,
    };
  },

  data() {
    return {
      theme: THEME_LIGHT,
      warning: undefined as constants.WarningProp | undefined,
      path: ROOT_PATH,
      dirs: {} as { [dir: string]: File[] },
      search: [] as File[],
      fetching: 0,
    };
  },

  computed: {
    files(): File[] {
      const target = this.path;
      const normalized = this.normalizePath(target);
      if (!this.dirs[normalized]) {
        this.pullDirectoryFiles(target, "", (files) => {
          this.dirs[target] = files;
        });
      }

      return this.dirs[normalized];
    },
  },

  methods: {
    onSearchInput(filter: string) {
      if (!filter) {
        this.search = [];
        return;
      }

      this.pullDirectoryFiles("", filter, (files) => {
        this.search = files;
      });
    },

    onRowClick(file: File) {
      if (file.isDir) {
        const path = [this.path, file.name]
          .join(constants.PATH_SEPARATOR)
          .replace(PATH_REPLACE_REGEX, constants.PATH_SEPARATOR);

        this.onChangeDirectory(path);
      }
    },

    onChangeDirectory(path: string) {
      const normalized = this.normalizePath(path);
      if (normalized in this.dirs) {
        this.path = path;
        return;
      }

      this.pullDirectoryFiles(path, "", (files) => {
        this.dirs[path] = files;
        this.path = path;
      });
    },

    onResponseError(error: Error): void {
      this.warning = constants.WARNING_PROPS[error];
      if (this.warning) return;

      this.warning = constants.WARNING_PROPS[Error.ERR_UNKNOWN];
      if (this.warning) this.warning.text = error;
    },

    normalizePath(path: string): string {
      let normalized = path.replace(
        PATH_REPLACE_REGEX,
        constants.PATH_SEPARATOR
      );
      if (normalized[0] != constants.PATH_SEPARATOR) {
        normalized = constants.PATH_SEPARATOR.concat(normalized);
      }

      return normalized;
    },

    quitWarning() {
      this.warning = undefined;
    },

    pullDirectoryFiles(
      path: string,
      filter: string,
      callback: (files: File[]) => void
    ) {
      this.fetching += 1;

      const headers: { [key: string]: string } = {};
      headers["x-uid"] = "1";

      filebrowserService
        .getDirectory(path, filter, headers)
        .then((dir) => {
          const files = Object.values(dir.files).map((file) => {
            const f: File = {
              name: file.name,
              isDir: (file.flags & Flags.Directory) != 0,
              updatedAt: new Date(),
            };

            const updatedAt = file.metadata.find(
              (meta) => meta.key == METADATA_UPDATED_AT_KEY
            )?.value;

            if (updatedAt) {
              f.updatedAt.setTime(parseInt(updatedAt));
            }

            return f;
          });

          callback(files);
        })
        .catch((error) => this.onResponseError(error))
        .finally(() => {
          this.fetching -= 1;
        });
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

.search-item {
  font-size: 1rem;
  margin-left: $fib-5 * 1px;
  color: var(--color-text);
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
