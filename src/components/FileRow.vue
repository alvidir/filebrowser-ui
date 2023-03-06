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
import Directory from "@/domain/directory";

const secondsPerMinute = 60;
const secondsPerHour = 60 * secondsPerMinute;
const secondsPerDay = 24 * secondsPerHour;
const secondsPerMonth = 30 * secondsPerDay;
const secondsPerYear = 365 * secondsPerDay;

interface DirectoryCtrl extends ISubject {
  getDirectory: () => Directory | undefined;
  openfile: (file: FileData) => void;
  renameFile: (file: FileData, filename: string) => void;
  deleteFile: (file: FileData) => void;
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
      return this.file.url() ?? "#";
    },

    target(): string | undefined {
      if (this.file.isDirectory()) return;
      return "_blank";
    },

    contentSize(): string | undefined {
      if (this.file.isParentDirectory()) return;

      const size = this.file.size() ?? 0;
      if (size) return `${size} ${size > 1 ? "items" : "item"}`;
      else return "empty";
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

      if (seconds < secondsPerMinute) {
        return "few seconds ago";
      }

      const scaleTime = (scale: number): number => {
        return Math.floor(seconds / scale);
      };

      if (seconds < secondsPerHour) {
        const total = scaleTime(secondsPerMinute);
        return `${total} minute${total > 1 ? "s" : ""} ago`;
      }

      if (seconds < secondsPerDay) {
        const total = scaleTime(secondsPerHour);
        return `${total} hour${total > 1 ? "s" : ""} ago`;
      }

      if (seconds < secondsPerMonth) {
        const total = scaleTime(secondsPerDay);
        return `${total} day${total > 1 ? "s" : ""} ago`;
      }

      if (seconds < secondsPerYear) {
        const total = scaleTime(secondsPerMonth);
        return `${total} month${total > 1 ? "s" : ""} ago`;
      }

      const total = scaleTime(secondsPerYear);
      return `${total} year${total > 1 ? "s" : ""} ago`;
    },
  },

  methods: {
    open() {
      if (!this.file.isDirectory()) return;
      this.directoryCtrl?.openfile(this.file);
    },

    checkRenameValue() {
      this.isValidFilename(this.rename.value);
    },

    onStartRename() {
      this.rename.active = true;
      this.$nextTick(() => (this.$refs.rename as HTMLInputElement)?.focus());
    },

    onSubmitRename() {
      const renameValue = this.rename.value;
      if (this.isValidFilename(renameValue)) {
        this.directoryCtrl?.renameFile(this.file, renameValue);
      }

      this.resetRename();
    },

    isValidFilename(name: string): boolean {
      this.rename.error = FileData.checkName(name) ?? "";
      const directory = this.directoryCtrl?.getDirectory();
      if (!this.rename.error && directory?.exists(name)) {
        this.rename.error = "This filename already exists";
      }

      return !this.rename.error;
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
      this.directoryCtrl?.deleteFile(this.file);
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
