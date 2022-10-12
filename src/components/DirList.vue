<template>
  <div class="header round-corners top-only">
    <v-slot>
      <div class="path-nav">
        <i class="bx bxs-folder-open"></i>
        <button v-for="dir in directories" :key="dir">
          {{ dir }}
        </button>
      </div>
    </v-slot>
  </div>
  <div class="table-wrapper round-corners bottom-only">
    <table>
      <tr v-for="file in sortedFiles" :key="file.name">
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
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export enum DisplayOps {
  LIST = "list",
  GRID = "grid",
}

export interface File {
  name: string;
  isDir: boolean;
  updatedAt: number;
  size?: {
    value: number;
    unit: string;
  };
  tags?: string[];
}

const PATH_SEPARATOR = "/";

export default defineComponent({
  name: "DirList",
  events: [],
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
  },

  setup() {
    return {
      DisplayOps,
    };
  },

  computed: {
    sortedFiles(): File[] {
      if (!this.files) return [];

      let files = this.files;
      return files.sort((a: File, b: File) => {
        const sortIndex = a.name > b.name ? 1 : -1;
        if ((a.isDir && b.isDir) || (!a.isDir && !b.isDir)) return sortIndex;
        return a.isDir ? -1 : 1;
      });
    },

    directories(): string[] {
      return this.path.split(PATH_SEPARATOR);
    },
  },

  methods: {
    printElapsedTimeSince(time: number): string {
      return "2 months ago";
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

$border-color: var(--color-text-disabled);

.header {
  width: 100%;
  height: $fib-9 * 1px;
  background: var(--color-button-hover);
  border: 1px solid;
  border-color: $border-color;
  box-sizing: border-box;

  .path-nav {
    display: flex;
    align-items: center;
    padding: 0 $fib-6 * 1px;
    height: 100%;

    button {
      height: fit-content;
      font-size: $default-fontsize;
      color: var(--color-secondary-text);
      background: transparent;
      font-weight: 900;
      border: none;

      &:hover {
        color: var(--color-text);
      }

      &:last-child {
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

  table {
    width: 100%;
    border: none;
    outline: none;
    border-collapse: collapse;
    white-space: nowrap;

    tr {
      height: $fib-8 * 1px;

      &:hover {
        background: var(--color-button-hover);
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

        label {
          border: 1px solid var(--color-button-hover);
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
