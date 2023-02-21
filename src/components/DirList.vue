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
          v-bind="item"
          v-for="item in files"
          :file="item"
          :key="item.name"
          :class="{ new: item.new }"
          :draggable="isDraggable(item)"
          @open="onOpenFile(item)"
          @rename="onFilenameChange(item, $event)"
          @dragstart="onDragStart(item)"
          @dragenter="onDragEnter(item)"
          @dragexit="onDragExit(item, $event)"
          @mouseup.right="onRightClick(item)"
          @contextmenu.prevent
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
import FileData from "@/domain/file";
import DirectoryController from "@/controllers/directory";
import Tag, { Tags } from "@/domain/tag";

interface DirListItem extends FileData {
  rename?: boolean;
  source?: boolean;
  target?: boolean;
  new?: boolean;
}

const NOTHING_TO_DISPLAY = "Nothing to display";
const CHANGEDIR_EVENT_NAME = "changedir";
const OPENFILE_EVENT_NAME = "openfile";
const RELOCATE_EVENT_NAME = "relocate";
const RENAME_EVENT_NAME = "rename";
const DELETE_EVENT_NAME = "delete";

export default defineComponent({
  name: "DirList",
  events: [
    CHANGEDIR_EVENT_NAME,
    OPENFILE_EVENT_NAME,
    RELOCATE_EVENT_NAME,
    RENAME_EVENT_NAME,
    DELETE_EVENT_NAME,
  ],
  components: { DirListRow },
  props: {
    files: {
      type: Object as PropType<Array<DirListItem>>,
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
        context: undefined as DirListItem | undefined,
      },
    };
  },

  computed: {
    paths(): string[] {
      return this.path.split(constants.pathSeparator);
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
      return ["root"]
        .concat(this.paths)
        .slice(-this.maxDirs)
        .filter((dir) => dir.length);
    },
  },

  methods: {
    onDragStart(item: DirListItem) {
      this.files.forEach((item) => (item.target = false));
      item.source = true;
    },

    onDragExit(item: DirListItem, event: DragEvent) {
      if (event.buttons && !item.source) {
        item.target = false;
      }
    },

    onDragEnter(item: DirListItem) {
      if (!item.source && item.isDirectory()) {
        item.target = true;
      }
    },

    onDragEnd() {
      // TODO: all three iterations can be simplified in a single one
      const source = this.files?.find((item) => item.source);
      const target = this.files?.find((item) => item.target);

      this.files?.map((item) => {
        item.source = false;
        item.target = false;
      });

      if (!source || !target) return;
      this.$emit(RELOCATE_EVENT_NAME, source, target);
    },

    onOpenFile(item: DirListItem) {
      if (item.isParentDirectory()) {
        this.$emit(CHANGEDIR_EVENT_NAME, -1);
        return;
      }

      this.$emit(OPENFILE_EVENT_NAME, item);
    },

    onMenuOptionClick(action: string) {
      const actions: { [key: string]: () => void } = {
        delete: () => this.$emit(DELETE_EVENT_NAME, this.menu.context),
        rename: () => {
          if (this.menu.context) this.menu.context.rename = true;
        },
        open: () => this.menu.context && this.onOpenFile(this.menu.context),
      };

      actions[action]();
      this.onMenuClose();
    },

    onDirectoryClick(index: number) {
      const delta = this.directories.length - 1 - index;
      if (delta) this.$emit(CHANGEDIR_EVENT_NAME, delta);
    },

    isDraggable(item: DirListItem): boolean {
      return (
        !item.isParentDirectory() &&
        !item.tags().includes((tag: Tag) => tag.name == Tags.Virtual)
      );
    },

    onRightClick(item: DirListItem) {
      if (item.isParentDirectory()) return;

      this.menu.context = item;
      this.menu.context.target = true;
    },

    onMenuClose() {
      if (this.menu.context) this.menu.context.target = false;
      this.menu.context = undefined;
    },

    onFilenameChange(file: DirListItem, filename: string | undefined) {
      file.rename = false;

      if (filename && !this.directoryCtrl?.getFilenameError(filename)) {
        this.$emit(RENAME_EVENT_NAME, file, filename);
      }
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
