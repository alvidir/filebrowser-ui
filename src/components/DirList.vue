<template>
  <div class="dir-list">
    <div class="header round-corners top-only">
      <div class="path-nav">
        <i class="bx bxs-folder-open"></i>
        <button
          v-for="(dir, index) in directories"
          :key="dir"
          @click="onChangeDirectory(index)"
        >
          {{ dir }}
        </button>
      </div>
    </div>
    <div class="table-wrapper round-corners bottom-only">
      <table>
        <tr v-if="!filesList.length">
          <td class="empty">
            <i class="bx bx-search-alt"></i>
            <strong>{{ NOTHING_TO_DISPLAY }}</strong>
          </td>
        </tr>
        <tr
          v-for="file in filesList"
          :key="file.name"
          :class="{ new: file.new, 'drag-target': file.dragTarget }"
          draggable="true"
          @click="onClick(file)"
          @dragstart="onDragStart(file)"
          @dragend="onDragEnd()"
          @dragenter="onDragEnter(file)"
          @dragexit="onDragExit(file, $event)"
        >
          <td class="filename">
            <i v-if="file.isDir" class="bx bxs-folder"></i>
            <i v-else class="bx bx-file-blank"></i>
            <span>{{ file.name }}</span>
          </td>
          <td>
            <div class="tags-list">
              <file-flag
                v-for="tag in tags(file)"
                :key="tag"
                v-bind="getTagProps(tag)"
              >
                {{ tag }}
              </file-flag>
            </div>
          </td>
          <td>
            <span v-if="file.size">
              {{ file.size.value }} {{ file.size.unit }}
            </span>
            <span v-else>&nbsp;</span>
          </td>
          <td class="elapsed-time">
            {{ printElapsedTimeSince(file.updatedAt) }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import FileFlag from "@/components/FileTag.vue";
import * as constants from "@/constants";
import { stringLiteral } from "@babel/types";

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
const SECONDS_PER_MONTH = 30 * SECONDS_PER_DAY;
const SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY;

export enum DisplayOps {
  LIST = "list",
  GRID = "grid",
}

export interface File {
  id: string;
  name: string;
  isDir: boolean;
  updatedAt: Date;
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

export const CLICK_EVENT_NAME = "click";
export const NAVIGATE_EVENT_NAME = "navigate";
export const RELOCATE_EVENT_NAME = "relocate";

export default defineComponent({
  name: "DirList",
  events: [CLICK_EVENT_NAME, NAVIGATE_EVENT_NAME, RELOCATE_EVENT_NAME],
  components: { FileFlag },
  props: {
    display: {
      type: String as PropType<DisplayOps>,
      default: DisplayOps.LIST,
    },
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
      DisplayOps,
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

      return files;
    },

    directories(): string[] {
      return this.path.split(constants.PATH_SEPARATOR);
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
      const source = this.files?.find((file) => file.dragSource);
      const target = this.files?.find((file) => file.dragTarget);

      this.files?.map((file) => {
        file.dragSource = false;
        file.dragTarget = false;
      });

      if (!source || !target) return;
      this.$emit(RELOCATE_EVENT_NAME, target, source);
    },

    tags(file: File): string[] {
      return file.tags?.slice(0, this.maxTags) ?? [];
    },

    getTagProps(tag: string): constants.TagProps {
      if (tag in constants.TAG_PROPS) {
        return constants.TAG_PROPS[tag];
      }

      return {
        tag: tag,
      };
    },

    printElapsedTimeSince(from: Date): string {
      const now = new Date().getTime();
      const seconds = (now - from.getTime()) / 1000;

      if (seconds < 20) {
        return "just now";
      }

      if (seconds < SECONDS_PER_MINUTE) {
        return "few seconds ago";
      }

      const scaleTime = (scale: number): number => {
        return Math.floor(seconds / scale);
      };

      if (seconds < SECONDS_PER_HOUR) {
        const total = scaleTime(SECONDS_PER_MINUTE);
        return `${total} minute${total > 1 ? "s" : ""} ago`;
      }

      if (seconds < SECONDS_PER_DAY) {
        const total = scaleTime(SECONDS_PER_HOUR);
        return `${total} hour${total > 1 ? "s" : ""} ago`;
      }

      if (seconds < SECONDS_PER_MONTH) {
        const total = scaleTime(SECONDS_PER_DAY);
        return `${total} day${total > 1 ? "s" : ""} ago`;
      }

      if (seconds < SECONDS_PER_YEAR) {
        const total = scaleTime(SECONDS_PER_MONTH);
        return `${total} month${total > 1 ? "s" : ""} ago`;
      }

      const total = scaleTime(SECONDS_PER_YEAR);
      return `${total} year${total > 1 ? "s" : ""} ago`;
    },

    onClick(file: File) {
      this.$emit(CLICK_EVENT_NAME, file);
    },

    onChangeDirectory(index: number) {
      this.$emit(
        NAVIGATE_EVENT_NAME,
        this.directories.slice(1, index + 1).join(constants.PATH_SEPARATOR)
      );
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
  //min-width: fit-content;
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

.filename {
  min-width: 30%;
  white-space: nowrap;
}

.elapsed-time {
  min-width: 25%;
  text-align: right;
  white-space: nowrap;
}
.tags-list {
  display: flex;
  width: 100%;

  :not(:first-child) {
    padding-left: $fib-4 * 1px;
  }
}

i {
  font-size: large;
  color: var(--color-text-secondary);
  padding-right: $fib-6 * 1px;
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

    tr {
      height: $fib-8 * 1px;

      &.drag-target {
        @extend .shadow-box;
        background: var(--color-button);
        z-index: 1;
      }

      &.new {
        animation-name: ephemeral-highlight;
        animation-duration: $fib-1 * 1s;
        animation-timing-function: ease-in;
      }

      &:hover td:not(.empty) {
        background: var(--color-button);
      }

      td {
        border-top: 1px solid;
        border-color: var(--color-border);
        width: fit-content;

        &:first-child {
          padding-left: $fib-6 * 1px;
          padding-right: $fib-7 * 1px;
        }

        &:not(:first-child) {
          color: var(--color-text-secondary);
          padding-right: $fib-6 * 1px;
        }

        &.empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: $fib-12 * 1px;
          justify-content: center;
          color: var(--color-text-secondary);
          width: 100%;

          i {
            font-size: xx-large;
            margin-bottom: $fib-5 * 1px;
          }
        }
      }
    }
  }
}
</style>
