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
          <div class="search-item">
            <i class="bx bx-file-blank"></i>
            <label>{{ props.item.name }}</label>
          </div>
        </search-field>
        <span id="action-buttons">
          <new-project
            class="action"
            :path="path"
            :apps="apps"
            @submit="onNewProject"
          >
          </new-project>
          <new-folder
            class="action"
            :path="path"
            :validate="isValidFolderName"
            @submit="createNewFolder"
          ></new-folder>
        </span>
      </div>
      <dir-list
        :files="filteredFiles"
        :path="path"
        @openfile="onOpenfile"
        @changedir="onChangeDirectory"
        @relocate="relocate"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Filebrowser, {
  Flags,
  Error,
  FileMetadata,
  MetadataKey,
} from "@/filebrowser.service";
import DirList, { File } from "@/components/DirList.vue";
import NewProject, { App } from "@/components/NewProject.vue";
import NewFolder from "@/components/NewFolder.vue";
import Config from "@/config.json";
import { GetTheme, SwitchTheme } from "fibonacci-styles/util";
import * as constants from "@/constants";
import { FieldController } from "vue-fields/src/main";
import Apps from "@/assets/applications.json";

const filebrowserService = new Filebrowser(Config.FILEBROWSER_URI);

const ROOT_PATH = constants.PATH_SEPARATOR;
const PATH_REPLACE_REGEX = new RegExp(constants.PATH_SEPARATOR + "{1,}", "g");
const SEARCH_DEBOUNCE = 300;
const DEFAULT_PROJECT_NAME = "Untitled project";

export default defineComponent({
  name: "App",
  components: {
    DirList,
    NewProject,
    NewFolder,
  },

  setup() {
    return {
      SEARCH_DEBOUNCE,
      SwitchTheme,
    };
  },

  data() {
    const apps = Apps.map((value) => {
      return {
        id: value.id,
        title: value.title,
        icon: value.icon,
        url: value.url,
        fetching: false,
      };
    });

    return {
      warning: undefined as constants.WarningProps | undefined,
      path: window.location.pathname ?? ROOT_PATH,
      dirs: {} as { [dir: string]: File[] },
      search: [] as File[],
      apps: apps as App[],
      fetching: 0,
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

  computed: {
    dirFiles(): File[] {
      const target = this.path;
      const normalized = this.normalizePath(target);

      if (this.dirs[normalized] === undefined) {
        this.onChangeDirectory(normalized);
      }

      return this.dirs[normalized] || [];
    },

    filteredFiles(): File[] {
      const sortFn = (a: File, b: File): number => {
        if (a.name == constants.PARENT_DIRECTORY) return -1;
        if (b.name == constants.PARENT_DIRECTORY) return 1;

        const sortIndex = a.name > b.name ? 1 : -1;
        if ((a.isDir && b.isDir) || (!a.isDir && !b.isDir)) return sortIndex;
        return a.isDir ? -1 : 1;
      };

      const filterFn = (f: File): boolean => {
        const HIDEN_FILE_REGEX = new RegExp("^\\.\\w.*$", "g");
        const paths = f.name.split(constants.PATH_SEPARATOR);
        const match = paths[paths.length - 1].match(HIDEN_FILE_REGEX);
        return !match;
      };

      return this.dirFiles.filter(filterFn).sort(sortFn);
    },
  },

  methods: {
    dateFromUnix(unix: string | undefined): Date {
      if (!unix) unix = "0";
      return new Date(parseInt(unix, 16) * 1000);
    },

    insertParentDirectory(path: string, files: File[]) {
      if (path == constants.PATH_SEPARATOR) return;

      files.unshift({
        id: "",
        name: constants.PARENT_DIRECTORY,
        isDir: true,
        isDragSource: false,
      });
    },

    createNewFolder(name: string) {
      const normalized = this.normalizePath(this.path);
      const newFolder: File = {
        id: "",
        name: name,
        isDir: true,
        updatedAt: new Date(),
        new: true,
        tags: [constants.TAGS.VIRTUAL],
      };

      this.dirs[normalized] = [newFolder].concat(this.dirFiles);
    },

    isValidFolderName(name: string): string {
      if (this.dirFiles.some((file) => file.name == name)) {
        return "Name already exists";
      }

      return "";
    },

    onSwtichThemeClick() {
      SwitchTheme(Config.THEME_STORAGE_KEY);
    },

    onSearchInput(ctrl: FieldController) {
      const filter = ctrl.value();
      if (!filter) {
        this.search = [];
        return;
      }

      this.pullDirectoryFiles("", filter, (files) => {
        this.search = files;
      });
    },

    onOpenfile(file: File) {
      if (file.isDir) return;
    },

    onChangeDirectory(path: string) {
      // avoid highlighting new items each time they are displayed
      this.dirFiles?.forEach((file) => (file.new = false));

      const normalized = this.normalizePath(path);
      if (normalized in this.dirs) {
        this.path = normalized;
        return;
      }

      this.pullDirectoryFiles(normalized, "", (files) => {
        this.insertParentDirectory(normalized, files);
        this.dirs[normalized] = files;
        this.path = normalized;
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

      filebrowserService
        .getDirectory(path, filter, this.getBaseHeaders())
        .then((dir) => {
          const files = Object.values(dir.files).map((file) => {
            const f: File = {
              id: file.id,
              name: file.name,
              isDir: (file.flags & Flags.Directory) != 0,
              updatedAt: this.dateFromUnix(
                file.getMetadata(MetadataKey.UpdatedAt)
              ),
            };

            return f;
          });

          callback(files);
        })
        .catch((error) => this.onResponseError(error))
        .finally(() => {
          this.fetching -= 1;
        });
    },

    relocate(source: string, target: string) {
      this.fetching += 1;

      target = this.normalizePath(target);
      const components = this.normalizePath(source).split(
        constants.PATH_SEPARATOR
      );

      const filter = `^${components
        .slice(0, -1)
        .join(constants.PATH_SEPARATOR)
        .replaceAll("(", "\\(")
        .replaceAll(")", "\\)")}/(${components[components.length - 1]
        .replaceAll("(", "\\(")
        .replaceAll(")", "\\)")}(/.*)?)$`;

      const path = this.normalizePath(this.path);

      filebrowserService
        .relocate(target, filter, this.getBaseHeaders())
        .then(() => {
          delete this.dirs[target];
          this.pullDirectoryFiles(path, "", (files) => {
            this.insertParentDirectory(path, files);
            this.dirs[path] = files;
          });
        })
        .catch((error) => {
          this.onResponseError(error);
        })
        .finally(() => {
          this.fetching -= 1;
        });
    },

    onNewProject(app: App) {
      app.fetching = true;

      const normalized = this.normalizePath(this.path);
      const target = this.normalizePath(
        [this.path, DEFAULT_PROJECT_NAME].join(constants.PATH_SEPARATOR)
      );

      const headers = this.getBaseHeaders();
      const metadata: FileMetadata[] = [
        {
          key: MetadataKey.AppId,
          value: app.id,
        },
      ];

      filebrowserService
        .createEmptyFile(target, metadata, headers)
        .then((file) => {
          const targetUrl = `${app.url}/${file.id}`;
          window.open(targetUrl, "_blank")?.focus();

          const newFile: File = {
            id: file.id,
            name: file.name,
            isDir: false,
            updatedAt: this.dateFromUnix(
              file.getMetadata(MetadataKey.UpdatedAt)
            ),
            new: true,
          };

          this.dirs[normalized] = this.dirFiles.concat(newFile);
        })
        .catch((error) => {
          this.onResponseError(error);
        })
        .finally(() => {
          app.fetching = false;
        });
    },

    // getBaseHeaders returns a dictionary with some default values
    // when running in development mode
    getBaseHeaders(): { [key: string]: string } {
      const headers: { [key: string]: string } = {};
      if (process.env.NODE_ENV === "development") {
        headers["X-Uid"] = "1";
      }

      return headers;
    },
  },

  mounted() {
    GetTheme(Config.THEME_STORAGE_KEY);
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

.search-item {
  font-size: medium;
  margin-left: $fib-5 * 1px;
  color: var(--color-text-primary);

  i {
    margin-right: $fib-6 * 1px;
  }
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
