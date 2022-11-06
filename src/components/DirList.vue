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
        <tr v-if="!filteredFiles.length">
          <td class="empty">
            <i class="bx bx-search-alt"></i>
            <strong>{{ NOTHING_TO_DISPLAY }}</strong>
          </td>
        </tr>
        <tr
          v-for="file in filteredFiles"
          :key="file.name"
          @click="onClick(file)"
        >
          <td>
            <i v-if="file.isDir" class="bx bxs-folder"></i>
            <i v-else class="bx bx-file-blank"></i>
            <span>{{ file.name }}</span>
          </td>
          <td class="tags-list">
            <label v-for="tag in file.tags" :key="tag" class="round-corners">
              {{ tag }}
            </label>
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
import * as constants from "@/constants";

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
  name: string;
  isDir: boolean;
  updatedAt: Date;
  size?: {
    value: number;
    unit: string;
  };
  tags?: string[];
}

const NOTHING_TO_DISPLAY = "Nothing to display";
const HIDEN_FILE_REGEX = new RegExp("^\\..*$", "g");

export const CLICK_EVENT_NAME = "click";
export const NAVIGATE_EVENT_NAME = "navigate";

export default defineComponent({
  name: "DirList",
  events: [CLICK_EVENT_NAME, NAVIGATE_EVENT_NAME],
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
    sort: {
      type: Function as PropType<(a: File, b: File) => number>,
      default: (a: File, b: File): number => {
        const sortIndex = a.name > b.name ? 1 : -1;
        if ((a.isDir && b.isDir) || (!a.isDir && !b.isDir)) return sortIndex;
        return a.isDir ? -1 : 1;
      },
    },
    filter: {
      type: Function as PropType<(f: File) => boolean>,
      default: (f: File): boolean => {
        const paths = f.name.split(constants.PATH_SEPARATOR);
        const match = paths[paths.length - 1].match(HIDEN_FILE_REGEX);
        return !match;
      },
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
    filteredFiles(): File[] {
      let files = this.files ?? this.backup;
      if (!files) return [];

      return files.filter(this.filter).sort(this.sort);
    },

    directories(): string[] {
      return ["root"].concat(
        this.path.split(constants.PATH_SEPARATOR).filter((dir) => dir.length)
      );
    },
  },

  methods: {
    printElapsedTimeSince(from: Date): string {
      const now = new Date().getTime();
      const seconds = (now - from.getTime()) / 1000;

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

$border-color: var(--color-text-disabled);

.dir-list {
  display: flex;
  flex-direction: column;
  //min-width: fit-content;
}

.header {
  width: 100%;
  height: $fib-9 * 1px;
  background: var(--color-button);
  border: 1px solid;
  border-color: $border-color;
  box-sizing: border-box;

  .path-nav {
    display: flex;
    align-items: center;
    padding: 0 $fib-6 * 1px;
    height: 100%;

    .directory {
      height: fit-content;
      font-size: $default-fontsize;
      color: var(--color-secondary-text);
      background: transparent;
      font-weight: 900;
      border: none;
    }

    button {
      @extend .directory;

      &:hover {
        color: var(--color-accent);
      }

      &:last-child {
        cursor: default;
        color: var(--color-text);
      }

      &:not(:last-child)::after {
        padding: 0 $fib-4 * 1px;
        content: "/";
      }
    }
  }
}

.elapsed-time {
  text-align: right;
}

.tags-list {
  width: 50%;
  text-align: center;
}

i {
  font-size: $fib-7 * 1px;
  color: var(--color-secondary-text);
  padding-right: $fib-6 * 1px;
}

.table-wrapper {
  color: var(--color-text);
  font-size: $default-fontsize;

  width: 100%;
  border: 1px solid;
  border-color: $border-color;
  box-sizing: border-box;
  overflow: hidden;

  table {
    width: 100%;
    border: none;
    outline: none;
    border-collapse: collapse;
    white-space: nowrap;

    tr {
      height: $fib-8 * 1px;

      &:hover td:not(.empty) {
        background: var(--color-button);
      }

      td {
        border-top: 1px solid;
        border-color: $border-color;

        &:first-child {
          padding-left: $fib-6 * 1px;
        }

        &:not(:first-child) {
          color: var(--color-secondary-text);
          padding-right: $fib-6 * 1px;
        }

        &.empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: $fib-12 * 1px;
          justify-content: center;

          i {
            font-size: $fib-9 * 1px;
          }
        }

        label {
          border: 1px solid var(--color-text-disabled);
          transition: background $default-duration;
          padding: $fib-3 * 1px $fib-5 * 1px;

          &:hover {
            background: var(--color-button-active);
          }

          &:not(:first-child) {
            margin-left: $fib-4 * 1px;
          }
        }
      }
    }
  }
}
</style>
