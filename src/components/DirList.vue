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
          {{ dir }}
        </button>
      </div>
    </div>
    <div class="table-wrapper round-corners bottom-only">
      <table @dragend="onDragEnd()">
        <tr v-if="directory?.isRoot() && !directory.files.length">
          <td class="empty">
            <i class="bx bx-search-alt"></i>
            <strong>Nothing to display</strong>
          </td>
        </tr>
        <file-row
          v-for="item in files"
          :file="item"
          :key="item.name"
          :draggable="isDraggable(item)"
          :highlight="belongsToDrag(item)"
          :no-hover="onDragMode"
          @dragstart="onDragStart(item)"
          @dragenter="onDragEnter(item)"
          @dragexit="onDragExit(item, $event)"
        />
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import FileRow from "@/components/FileRow.vue";
import FileData, { parentDirName } from "@/domain/file";
import Tag, { Tags } from "@/domain/tag";
import Directory from "@/domain/directory";
import { ISubject } from "@/controllers/observer";

export const rootDirName = "root";

interface DirectoryCtrl extends ISubject {
  getDirectory: () => Directory | undefined;
  changeDirectory: (delta: number) => void;
  moveFile: (source: FileData, target: FileData) => void;
}

interface FilterCtrl extends ISubject {
  filter: (files: Array<FileData>) => Array<FileData>;
}

export default defineComponent({
  name: "DirList",
  components: { FileRow },
  props: {
    maxDirsLength: {
      type: Number,
      default: 55,
    },
  },

  setup() {
    return {
      directoryCtrl: inject<DirectoryCtrl>("directoryCtrl"),
      filterCtrl: inject<FilterCtrl>("filterCtrl"),
    };
  },

  data() {
    return {
      directory: this.currentDirectory(),
      files: this.filteredFiles(),
      drag: {
        source: undefined as FileData | undefined,
        target: undefined as FileData | undefined,
      },
    };
  },

  computed: {
    directories(): Array<string> {
      let allDirs = [rootDirName].concat(
        this.directory?.pathComponents() ?? []
      );

      let maxDirs = 1;
      let totalLength = 0;
      for (let index = allDirs.length; index > 0; index--) {
        if (totalLength + allDirs[index - 1].length > this.maxDirsLength) {
          break;
        }

        totalLength += allDirs[index - 1].length;
        maxDirs++;
      }

      return [rootDirName]
        .concat(this.directory?.pathComponents() ?? [])
        .slice(-maxDirs);
    },

    onDragMode(): boolean {
      return !!this.drag.source;
    },
  },

  methods: {
    currentDirectory(): Directory | undefined {
      return this.directoryCtrl?.getDirectory();
    },

    belongsToDrag(item: FileData) {
      return this.drag.source === item || this.drag.target === item;
    },

    onDragStart(item: FileData) {
      this.drag.source = item;
      this.drag.target = undefined;
    },

    onDragExit(item: FileData, event: DragEvent) {
      if (item === this.drag.target && event.buttons) {
        this.drag.target = undefined;
      }
    },

    onDragEnter(item: FileData) {
      if (item !== this.drag.source && item.isDirectory()) {
        this.drag.target = item;
      }
    },

    onDragEnd() {
      if (this.drag.source && this.drag.target) {
        this.directoryCtrl?.moveFile(this.drag.source, this.drag.target);
      }

      this.drag.source = undefined;
      this.drag.target = undefined;
    },

    onDirectoryClick(index: number) {
      const delta = this.directories.length - 1 - index;
      if (delta) this.directoryCtrl?.changeDirectory(-delta);
    },

    isDraggable(item: FileData): boolean {
      return !item.tags().includes((tag: Tag) => tag.name == Tags.Virtual);
    },

    buildParentDirFile(): FileData {
      return new FileData("", parentDirName, "");
    },

    filteredFiles(): Array<FileData> {
      const parentDir = this.buildParentDirFile();
      if (!this.directory) return [parentDir];

      const baseFiles = this.directory.isRoot() ? [] : [parentDir];
      const dirFiles = this.filterCtrl
        ? this.filterCtrl.filter(this.directory.files)
        : this.directory.files;

      return baseFiles.concat(dirFiles);
    },

    update() {
      this.directory = this.currentDirectory();
      this.files = this.filteredFiles();
    },
  },

  mounted() {
    this.directoryCtrl?.addObserver(this);
  },

  unmounted() {
    this.directoryCtrl?.removeObserver(this);
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

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
