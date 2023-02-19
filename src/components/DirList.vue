<template>
  <div class="dir-list">
    <div class="header round-corners top-only">
      <div class="path-nav">
        <i class="bx bxs-folder-open"></i>
        <button
          v-for="(dir, index) in directories"
          :key="dir"
          @click="onDirectoryClick(index)"
        >
          {{ utils.underscoresToSpaces(dir) }}
        </button>
      </div>
    </div>
    <div class="table-wrapper round-corners bottom-only">
      <table @dragend="onDragEnd()">
        <tr v-if="!files.length">
          <td class="empty">
            <i class="bx bx-search-alt"></i>
            <strong>{{ NOTHING_TO_DISPLAY }}</strong>
          </td>
        </tr>
        <dir-list-row
          v-for="file in files"
          :key="file.name"
          :class="{ new: file.new }"
          :draggable="isDraggable(file)"
          :file="file"
          @open="onOpenClick(file)"
          @rename="onFilenameChange(file, $event)"
          @dragstart="onDragStart(file)"
          @dragenter="onDragEnter(file)"
          @dragexit="onDragExit(file, $event)"
          @mouseup.right="onRightClick(file)"
          @contextmenu.prevent
          v-bind="file"
        />
      </table>
    </div>
    <context-menu :active="!!menu.context" @close="onMenuClose">
      <button @click="onMenuOptionClick('open')">Open</button>
      <button @click="onMenuOptionClick('rename')">Rename</button>
      <button class="danger" @click="onMenuOptionClick('delete')">
        Remove
      </button>
    </context-menu>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, PropType } from "vue";
import DirListRow from "@/components/DirListRow.vue";
import * as constants from "@/constants";
import * as utils from "@/utils";
import { FileData } from "@/domain/directory";
import DirectoryController from "@/controllers/directory";

export class ExtendedFileData extends FileData {
  rename: boolean = false;
  source: boolean = false;
  target: boolean = false;
  new: boolean = false;
}

const NOTHING_TO_DISPLAY = "Nothing to display";
const CHANGEDIR_EVENT_NAME = "changedir";
const OPENFILE_EVENT_NAME = "openfile";
const RELOCATE_EVENT_NAME = "relocate";
const DELETE_EVENT_NAME = "delete";

export default defineComponent({
  name: "DirList",
  events: [
    CHANGEDIR_EVENT_NAME,
    OPENFILE_EVENT_NAME,
    RELOCATE_EVENT_NAME,
    DELETE_EVENT_NAME,
  ],
  components: { DirListRow },
  props: {
    files: {
      type: Object as PropType<Array<ExtendedFileData>>,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    maxDirsLength: {
      type: Number,
      default: 55,
    },
  },

  setup() {
    let directoryCtrl = inject("directoryCtrl") as
      | DirectoryController
      | undefined;

    return {
      NOTHING_TO_DISPLAY,
      directoryCtrl,
      utils,
    };
  },

  data() {
    return {
      menu: {
        context: undefined as ExtendedFileData | undefined,
      },
    };
  },

  computed: {
    paths(): string[] {
      return this.path.split(constants.PATH_SEPARATOR);
    },

    maxDirs(): number {
      let allDirs = ["root"].concat(this.paths);
      let totalLength = 0;
      let howMany = 1;

      for (let index = allDirs.length; index > 0; index--) {
        if (totalLength + allDirs[index - 1].length > this.maxDirsLength) {
          break;
        }

        totalLength += allDirs[index - 1].length;
        howMany++;
      }

      return howMany;
    },

    directories(): string[] {
      return ["root"].concat(this.paths).slice(-this.maxDirs);
    },

    parentDirectory(): string {
      return this.paths.slice(0, -1).join(constants.PATH_SEPARATOR);
    },
  },

  methods: {
    onDragStart(file: ExtendedFileData) {
      this.files.forEach((file) => (file.target = false));
      file.source = true;
    },

    onDragExit(file: ExtendedFileData, event: DragEvent) {
      if (event.buttons && !file.source) {
        file.target = false;
      }
    },

    onDragEnter(file: ExtendedFileData) {
      if (file.source || !file.isDirectory()) return;
      file.target = true;
    },

    onDragEnd() {
      // TODO: all three iterations can be simplified in a single one
      const sourceFile = this.files?.find((file) => file.source);
      const targetFile = this.files?.find((file) => file.target);

      this.files?.map((file) => {
        file.source = false;
        file.target = false;
      });

      if (!sourceFile || !targetFile) return;

      const source = [this.path, sourceFile.name].join(
        constants.PATH_SEPARATOR
      );

      if (targetFile.isParentDirectory()) {
        this.$emit(RELOCATE_EVENT_NAME, source, this.parentDirectory);
        return;
      }

      const target = [this.path, targetFile.name].join(
        constants.PATH_SEPARATOR
      );

      this.$emit(RELOCATE_EVENT_NAME, source, target);
    },

    onOpenClick(file: ExtendedFileData) {
      if (!file.isDirectory()) {
        this.$emit(OPENFILE_EVENT_NAME, file);
        return;
      }

      let target = [this.path, file.name].join(constants.PATH_SEPARATOR);
      if (file.isParentDirectory()) {
        target = this.parentDirectory;
      }

      this.$emit(CHANGEDIR_EVENT_NAME, target);
    },

    onMenuOptionClick(action: string) {
      let target = [this.path, this.menu.context?.name].join(
        constants.PATH_SEPARATOR
      );

      const actions: { [key: string]: () => void } = {
        delete: () => this.$emit(DELETE_EVENT_NAME, target, this.menu.context),
        rename: () => {
          if (this.menu.context) this.menu.context.rename = true;
        },
        open: () => this.menu.context && this.onOpenClick(this.menu.context),
      };

      actions[action]();
      this.onMenuClose();
    },

    onDirectoryClick(index: number) {
      let hidden = 0;
      if (this.maxDirs && this.directories.length > this.maxDirs - 1) {
        hidden = this.directories.length - this.maxDirs + 1;
      }

      this.$emit(
        CHANGEDIR_EVENT_NAME,
        this.paths.slice(1, index + hidden + 1).join(constants.PATH_SEPARATOR)
      );
    },

    isDraggable(file: ExtendedFileData): boolean {
      return !file.metadata.get("tags")?.includes("virtual");
    },

    onRightClick(file: ExtendedFileData) {
      if (file.isParentDirectory()) return;

      this.menu.context = file;
      this.menu.context.target = true;
    },

    onMenuClose() {
      if (this.menu.context) this.menu.context.target = false;
      this.menu.context = undefined;
    },

    onFilenameChange(file: ExtendedFileData, filename: string) {
      file.rename = false;

      if (!filename || this.directoryCtrl?.checkFilename(filename)) {
        // the filename contains errors
        return;
      }

      const source = [this.path, file.name].join(constants.PATH_SEPARATOR);
      const target = [this.path, filename].join(constants.PATH_SEPARATOR);

      this.$emit(RELOCATE_EVENT_NAME, source, target);
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";
@import url(@/styles.css);

.dir-list {
  display: flex;
  flex-direction: column;
}

i {
  font-size: large;
  color: var(--color-text-secondary);
  padding-right: $fib-6 * 1px;
}

.header {
  width: 100%;
  height: $fib-9 * 1px;
  background: var(--color-bg-primary);
  border: 1px solid;
  border-color: var(--color-border);
  box-sizing: border-box;

  .path-nav {
    display: flex;
    align-items: center;
    padding: 0 $fib-6 * 1px;
    height: 100%;

    .directory {
      height: fit-content;
      font-size: medium;
      color: var(--color-text-secondary);
      background: transparent;
      border: none;
    }

    button {
      @extend .directory;

      &:last-child {
        cursor: default;
        color: var(--color-text-primary);
        font-weight: 600;
      }

      &:not(:last-child):hover {
        color: var(--color-accent);
      }

      &:not(:last-child)::after {
        padding: 0 $fib-4 * 1px;
        content: "/";
      }
    }
  }
}

.table-wrapper {
  color: var(--color-text-primary);
  font-size: medium;
  border: 1px solid;
  border-color: var(--color-border);
  box-sizing: border-box;
  overflow: hidden;

  table {
    width: 100%;
    border: none;
    outline: none;
    border-collapse: collapse;
  }

  td.empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: $fib-12 * 1px;
    justify-content: center;
    color: var(--color-text-secondary);
    border-top: 1px solid var(--color-border);
    width: 100%;

    i {
      font-size: xx-large;
      margin-bottom: $fib-5 * 1px;
    }
  }
}
</style>
