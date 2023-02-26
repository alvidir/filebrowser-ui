<template>
  <tr
    :class="{
      target: target || source || rename,
      'parent-dir': file.isParentDirectory(),
    }"
    @click="file.isParentDirectory() && open()"
  >
    <td class="filename" :class="{ error: error }">
      <i v-if="file.isParentDirectory()" class="bx bx-arrow-back"></i>
      <i v-else-if="file.isDirectory()" class="bx bxs-folder"></i>
      <i v-else class="bx bx-file-blank"></i>
      <a v-if="!rename && !file.isParentDirectory()" href="#" @click="open()">
        {{ file.filename() }}
      </a>
      <input
        v-show="!file.isParentDirectory() && rename"
        ref="rename"
        v-model="renameValue"
        :placeholder="file.filename()"
        @keydown.enter="applyRename"
        @keydown.esc="cancelRename"
        @input="validateRenameValue"
        @blur="cancelRename"
      />

      <div class="cause" v-if="error">{{ error }}</div>
    </td>
    <td>
      <div class="tags-list">
        <file-tag v-for="tag in file.tags()" :key="tag.name" v-bind="tag">
          {{ tag }}
        </file-tag>
      </div>
    </td>
    <td class="file-size">
      <span v-if="file.size()"> {{ contentSize }} </span>
      <span v-else>&nbsp;</span>
    </td>
    <td class="elapsed-time">
      <span>{{ elapsedTime }}</span>
    </td>
  </tr>
</template>

<script lang="ts">
import { defineComponent, PropType, inject } from "vue";
import FileTag from "@/components/FileTag.vue";
import FileData from "@/domain/file";

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
const SECONDS_PER_MONTH = 30 * SECONDS_PER_DAY;
const SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY;

const OPEN_EVENT_NAME = "open";
const RENAME_EVENT_NAME = "rename";

interface DirectoryController {
  getFilenameError(name: string): string | undefined;
}

export default defineComponent({
  name: "DirListRow",
  events: [OPEN_EVENT_NAME, RENAME_EVENT_NAME],
  components: {
    FileTag,
  },
  props: {
    file: {
      type: Object as PropType<FileData>,
      required: true,
    },
    rename: Boolean,
    target: Boolean,
    source: Boolean,
  },

  watch: {
    rename(value: boolean) {
      if (value)
        this.$nextTick(() => (this.$refs.rename as HTMLInputElement)?.focus());
    },
  },

  setup() {
    let directoryCtrl = inject("directoryCtrl") as
      | DirectoryController
      | undefined;

    return {
      directoryCtrl,
    };
  },

  data() {
    return {
      renameValue: "",
      error: "" as string | undefined,
    };
  },

  computed: {
    contentSize(): string {
      const size = this.file.size() ?? 0;
      return `${size} ${size > 1 ? "items" : "item"}`;
    },

    elapsedTime(): string {
      const now = new Date().getTime();
      const seconds = (now - this.file.updatedAt().getTime()) / 1000;

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
  },

  methods: {
    open() {
      this.$emit(OPEN_EVENT_NAME);
    },

    validateRenameValue() {
      if (!this.renameValue) {
        this.error = undefined;
        return;
      }

      this.error = this.directoryCtrl?.getFilenameError(this.renameValue);
    },

    cancelRename() {
      this.renameValue = this.file.name;
      this.$emit(RENAME_EVENT_NAME);
      this.finishRename();
    },

    applyRename() {
      if (this.renameValue && !this.error) {
        this.$emit(RENAME_EVENT_NAME, this.renameValue);
      }

      this.finishRename();
    },

    finishRename() {
      this.renameValue = "";
      this.error = "";
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

.target {
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

  &.target {
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
