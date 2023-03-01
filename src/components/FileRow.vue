<template>
  <tr
    :class="{
      highlight: highlight || rename.active,
      'parent-dir': file.isParentDirectory(),
      'no-hover': noHover,
    }"
    @click="file.isParentDirectory() && open()"
    @mouseup.right="onOpenContextMenu()"
    @contextmenu.prevent
  >
    <td class="filename" :class="{ error: rename.error }">
      <i v-if="file.isParentDirectory()" class="bx bx-arrow-back"></i>
      <i v-else-if="file.isDirectory()" class="bx bxs-folder"></i>
      <i v-else class="bx bx-file-blank"></i>
      <a
        v-if="!rename.active && !file.isParentDirectory()"
        :href="href"
        :target="target"
        @click="open()"
      >
        {{ file.name }}
      </a>
      <input
        ref="rename"
        v-show="!file.isParentDirectory() && rename.active"
        v-model="rename.value"
        :placeholder="file.name"
        @keydown.enter="onSubmitRename"
        @keydown.esc="resetRename"
        @input="checkRenameValue"
        @blur="resetRename"
      />

      <div class="error-message" v-if="rename.error">{{ rename.error }}</div>
    </td>
    <td>
      <div class="tags-list">
        <file-tag v-for="tag in file.tags()" :key="tag.name" v-bind="tag">
          {{ tag }}
        </file-tag>
      </div>
    </td>
    <td class="file-size">
      <span v-if="file.size() !== undefined"> {{ contentSize }} </span>
      <span v-else>&nbsp;</span>
    </td>
    <td class="elapsed-time">
      <span v-if="file.updatedAt()">{{ elapsedTime }}</span>
    </td>
    <context-menu :active="showCtxMenu" @close="onCloseContextMenu">
      <button @click="onClickContextMenu('open')">Open</button>
      <button @click="onClickContextMenu('rename')">Rename</button>
      <button class="danger" @click="onClickContextMenu('delete')">
        Remove
      </button>
    </context-menu>
    <confirm-deletion
      :context="file"
      :active="showDialog"
      @submit="onSubmitDeletion"
      @cancel="onCancelDeletion"
    />
  </tr>
</template>

<script lang="ts">
import { defineComponent, PropType, inject } from "vue";
import FileTag from "@/components/FileTag.vue";
import FileData from "@/domain/file";
import { ISubject } from "@/controllers/observer";
import ConfirmDeletion from "@/components/ConfirmDeletion.vue";

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
const SECONDS_PER_MONTH = 30 * SECONDS_PER_DAY;
const SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY;

interface DirectoryCtrl extends ISubject {
  openfile: (file: FileData) => void;
  relocate: (source: FileData, target: FileData) => void;
  rename: (file: FileData, filename: string) => void;
  delete: (file: FileData) => void;
}

export default defineComponent({
  name: "FileRow",

  components: {
    FileTag,
    ConfirmDeletion,
  },

  props: {
    file: {
      type: Object as PropType<FileData>,
      required: true,
    },
    highlight: Boolean,
    reveal: Boolean,
    noHover: Boolean,
  },

  setup() {
    return {
      directoryCtrl: inject<DirectoryCtrl>("directoryCtrl"),
    };
  },

  data() {
    return {
      showCtxMenu: false,
      showDialog: false,
      rename: {
        active: false,
        value: "",
        error: "",
      },
    };
  },

  computed: {
    href(): string {
      if (this.file.isDirectory()) return "#";
      return this.file.url()?.toString() ?? "#";
    },

    target(): string | undefined {
      if (this.file.isDirectory()) return;
      return "_blank";
    },

    contentSize(): string | undefined {
      if (this.file.isParentDirectory()) return;

      const size = this.file.size() ?? 0;
      return `${size} ${size > 1 || !size ? "items" : "item"}`;
    },

    elapsedTime(): string | undefined {
      if (this.file.isParentDirectory()) return;

      const updatedAt = this.file.updatedAt()?.getTime();
      if (updatedAt === undefined) return;

      const now = new Date().getTime();
      const seconds = (now - updatedAt) / 1000;

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
      if (!this.file.isDirectory()) return;
      this.directoryCtrl?.openfile(this.file);
    },

    checkRenameValue() {
      this.rename.error = this.file.checkName(this.rename.value) ?? "";
    },

    onStartRename() {
      this.rename.active = true;
      this.$nextTick(() => (this.$refs.rename as HTMLInputElement)?.focus());
    },

    onSubmitRename() {
      if (this.rename.value && !this.rename.error) {
        this.directoryCtrl?.rename(this.file, this.rename.value);
      }

      this.resetRename();
    },

    resetRename() {
      this.rename = {
        active: false,
        value: "",
        error: "",
      };
    },

    onOpenContextMenu() {
      if (this.file.isParentDirectory()) return;
      this.showCtxMenu = true;
    },

    onCloseContextMenu() {
      this.showCtxMenu = false;
    },

    onClickContextMenu(action: string) {
      const actions: { [key: string]: () => void } = {
        delete: () => (this.showDialog = true),
        rename: () => this.onStartRename(),
        open: () => this.open(),
      };

      actions[action]();
      this.onCloseContextMenu();
    },

    onRightClick() {
      this.showCtxMenu = true;
    },

    onSubmitDeletion() {
      this.directoryCtrl?.delete(this.file);
      this.onCancelDeletion();
    },

    onCancelDeletion() {
      this.showDialog = false;
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

.highlight {
  @extend .shadow-box;
  background: var(--color-button);
  z-index: 1;
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

    .error-message {
      font-size: small;
      margin-top: $fib-3 * 1px;
      margin-left: ($fib-8 - $fib-3) * 1px;
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

  &.reveal {
    animation-name: ephemeral-highlight;
    animation-duration: $fib-1 * 1s;
    animation-timing-function: ease-in;
  }

  &:not(.no-hover):hover {
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
