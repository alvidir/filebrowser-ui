<template>
  <tr
    :class="{
      'drag-target': isTarget || editable,
      'parent-dir': isParentDir,
    }"
    @click="isParentDir && onClick()"
  >
    <td class="filename" :class="{ error: error }">
      <i v-if="isParentDir" class="bx bx-arrow-back"></i>
      <i v-else-if="isDir" class="bx bxs-folder"></i>
      <i v-else class="bx bx-file-blank"></i>
      <a v-if="!isParentDir && !editable" href="#" @click="onClick">
        {{ name }}
      </a>
      <input
        v-show="!isParentDir && editable"
        ref="filename"
        v-model="filename"
        :placeholder="name"
        @blur="onBlur"
        @keydown.enter="onBlur"
        @input="onChange"
      />

      <div class="cause" v-if="error">{{ error }}</div>
    </td>
    <td>
      <div class="tags-list">
        <file-flag v-for="tag in tags" :key="tag" v-bind="getTagProps(tag)">
          {{ tag }}
        </file-flag>
      </div>
    </td>
    <td class="file-size">
      <span v-if="size"> {{ size.value }} {{ size.unit }} </span>
      <span v-else>&nbsp;</span>
    </td>
    <td class="elapsed-time">
      <span v-if="updatedAt">{{ printElapsedTimeSince(updatedAt) }}</span>
    </td>
  </tr>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import FileFlag from "@/components/FileTag.vue";
import * as constants from "@/constants";
import * as utils from "@/utils";

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
const SECONDS_PER_MONTH = 30 * SECONDS_PER_DAY;
const SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY;

export const OPEN_EVENT_NAME = "open";
export const RENAME_EVENT_NAME = "rename";

export interface Size {
  value: number;
  unit: string;
}

export default defineComponent({
  name: "DirListRow",
  events: [OPEN_EVENT_NAME, RENAME_EVENT_NAME],
  components: { FileFlag },
  props: {
    name: String,
    isDir: Boolean,
    tags: Object as PropType<Array<string>>,
    size: Object as PropType<Size>,
    updatedAt: Date,
    isTarget: Boolean,
    editable: Boolean,
    validate: Function as PropType<utils.ValidateFn>,
  },

  watch: {
    editable(value: boolean) {
      if (value) this.$nextTick(() => (this.$refs.filename as any)?.focus());
    },
  },

  data() {
    return {
      filename: "",
      error: "",
    };
  },

  computed: {
    isParentDir(): boolean {
      return this.name == constants.PARENT_DIRECTORY;
    },
  },

  methods: {
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

    getTagProps(tag: string): constants.TagProps {
      if (tag in constants.TAG_PROPS) {
        return constants.TAG_PROPS[tag];
      }

      return {
        tag: tag,
      };
    },

    onClick() {
      this.$emit(OPEN_EVENT_NAME);
    },

    onBlur() {
      this.$emit(RENAME_EVENT_NAME, utils.normalizeName(this.filename));
      this.filename = "";
      this.error = "";
    },

    onChange() {
      if (this.validate) {
        this.error = this.validate(utils.normalizeName(this.filename));
      }
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

.parent-dir {
  &:hover {
    cursor: pointer;
  }

  i {
    color: var(--color-accent);
    font-weight: 600;
  }
}

.drag-target {
  @extend .shadow-box;
  background: var(--color-button) !important;
  z-index: 1 !important;
}

.filename {
  min-width: 30%;
  white-space: nowrap;

  &.error {
    padding-top: $fib-6 * 1px;
    padding-bottom: $fib-6 * 1px;
    color: var(--color-red);

    input {
      color: var(--color-red);
    }

    .cause {
      font-size: small;
      margin-left: $fib-8 * 1px;
    }
  }

  a:not(:hover) {
    color: var(--color-text-primary);
  }

  input {
    height: 100%;
    width: 100%;
    background: none;
    border: none;
    outline: none;
    color: var(--color-text-primary);
    font-size: medium;
  }
}

.elapsed-time,
.file-size {
  text-align: right;
  white-space: nowrap;
}

.elapsed-time {
  min-width: 20%;
}

.file-size {
  min-width: 10%;
}

.tags-list {
  display: flex;
  width: 100%;

  :not(:first-child) {
    padding-left: $fib-4 * 1px;
  }
}

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

  &:not(.focused):hover td:not(.empty) {
    background: var(--color-button);
  }
}

td {
  border-top: 1px solid var(--color-border);
  width: fit-content;

  &:first-child {
    padding-left: $fib-6 * 1px;
    padding-right: $fib-7 * 1px;
  }

  &:not(:first-child) {
    color: var(--color-text-secondary);
    padding-right: $fib-6 * 1px;
  }

  i {
    font-size: large;
    color: var(--color-text-secondary);
    padding-right: $fib-6 * 1px;
  }
}
</style>
