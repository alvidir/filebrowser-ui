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
        <tr v-if="!filesList.length">
          <td class="empty">
            <i class="bx bx-search-alt"></i>
            <strong>{{ NOTHING_TO_DISPLAY }}</strong>
          </td>
        </tr>
        <dir-list-row
          v-for="file in filesList"
          :key="file.name"
          :class="{ new: file.new, 'drag-target': file.dragTarget }"
          :draggable="!isVirtual(file)"
          @open="onOpenClick(file)"
          @dragstart="onDragStart(file)"
          @dragenter="onDragEnter(file)"
          @dragexit="onDragExit(file, $event)"
          v-bind="file"
        />
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import DirListRow from "@/components/DirListRow.vue";
import * as constants from "@/constants";

export interface File {
  id: string;
  name: string;
  isDir: boolean;
  updatedAt?: Date;
  new?: boolean;
  size?: {
    value: number;
    unit: string;
  };
  tags?: string[];

  dragSource?: boolean;
  dragTarget?: boolean;
}

const NOTHING_TO_DISPLAY = "Nothing to display";

export const CHANGEDIR_EVENT_NAME = "changedir";
export const OPENFILE_EVENT_NAME = "openfile";
export const RELOCATE_EVENT_NAME = "relocate";

export default defineComponent({
  name: "DirList",
  events: [CHANGEDIR_EVENT_NAME, OPENFILE_EVENT_NAME, RELOCATE_EVENT_NAME],
  components: { DirListRow },
  props: {
    files: {
      type: Object as PropType<Array<File>>,
      required: false,
    },
    path: {
      type: String,
      required: true,
    },
    maxTags: {
      type: Number,
      default: 8,
    },
  },

  setup() {
    return {
      NOTHING_TO_DISPLAY,
    };
  },

  data() {
    return {
      backup: [] as File[],
    };
  },

  watch: {
    files(_: File[], old: File[]) {
      this.backup = old;
    },
  },

  computed: {
    filesList(): File[] {
      let files = this.files ?? this.backup;
      if (!files) return [];

      const paths = this.absolutePath
        .split(constants.PATH_SEPARATOR)
        .filter((path) => path.length);

      if (paths.length) {
        // then is not the root path
        files.unshift({
          id: "",
          name: constants.PARENT_DIRECTORY,
          isDir: true,
        });
      }

      return files;
    },

    paths(): string[] {
      return this.path.split(constants.PATH_SEPARATOR);
    },

    directories(): string[] {
      return ["root"].concat(this.paths.filter((path) => path.length));
    },

    absolutePath(): string {
      if (this.path && this.path[0] != constants.PATH_SEPARATOR) {
        return `${constants.PATH_SEPARATOR}${this.path}`;
      }

      return this.path;
    },

    parentDirectory(): string {
      return this.paths.slice(0, -1).join(constants.PATH_SEPARATOR);
    },
  },

  methods: {
    onDragStart(file: File) {
      file.dragSource = true;
    },

    onDragExit(file: File, e: any) {
      if (e.buttons) file.dragTarget = false;
    },

    onDragEnter(file: File) {
      if (file.dragSource || !file.isDir) return;
      file.dragTarget = true;
    },

    onDragEnd() {
      // TODO: all three iterations can be simplified in a single one
      const sourceFile = this.files?.find((file) => file.dragSource);
      const targetFile = this.files?.find((file) => file.dragTarget);

      this.files?.map((file) => {
        file.dragSource = false;
        file.dragTarget = false;
      });

      if (!sourceFile || !targetFile) return;

      const source = [this.absolutePath, sourceFile.name].join(
        constants.PATH_SEPARATOR
      );

      if (targetFile.name == constants.PARENT_DIRECTORY) {
        this.$emit(RELOCATE_EVENT_NAME, source, this.parentDirectory);
        return;
      }

      const target = [this.absolutePath, targetFile.name].join(
        constants.PATH_SEPARATOR
      );

      this.$emit(RELOCATE_EVENT_NAME, source, target);
    },

    onOpenClick(file: File) {
      if (!file.isDir) {
        this.$emit(OPENFILE_EVENT_NAME, file);
        return;
      }

      let target: string;
      if (file.name != constants.PARENT_DIRECTORY) {
        target = [this.absolutePath, file.name].join(constants.PATH_SEPARATOR);
      } else {
        target = this.parentDirectory;
      }

      this.$emit(CHANGEDIR_EVENT_NAME, target);
    },

    onDirectoryClick(index: number) {
      this.$emit(
        CHANGEDIR_EVENT_NAME,
        this.directories.slice(1, index + 1).join(constants.PATH_SEPARATOR)
      );
    },

    isVirtual(file: File): boolean {
      return !!file.tags?.some((tag) => tag == constants.TAGS.VIRTUAL);
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
