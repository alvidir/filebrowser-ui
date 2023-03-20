<script setup lang="ts">
import { defineProps, inject, computed, ref, reactive, nextTick } from "vue";
import FileTag from "@/components/FileTag.vue";
import FileData from "@/domain/file";
import ConfirmDeletion from "@/components/ConfirmDeletion.vue";
import Directory from "@/domain/directory";

const secondsPerMinute = 60;
const secondsPerHour = 60 * secondsPerMinute;
const secondsPerDay = 24 * secondsPerHour;
const secondsPerMonth = 30 * secondsPerDay;
const secondsPerYear = 365 * secondsPerDay;

interface DirectoryCtrl {
  getDirectory: () => Directory | undefined;
  openfile: (file: FileData) => void;
  renameFile: (file: FileData, filename: string) => void;
  deleteFile: (file: FileData) => void;
}

interface Props {
  file: FileData;
  highlight?: boolean;
  reveal?: boolean;
  noHover?: boolean;
  inject?: string;
}

const props = defineProps<Props>();

const directoryCtrl = inject<DirectoryCtrl>("directoryCtrl");

const showCtxMenu = ref(false);
const showDialog = ref(false);
const renameProps = reactive({
  active: false,
  value: "",
  error: "",
});

const href = computed((): string => {
  if (props.file.isDirectory()) return "#";
  return props.file.url() ?? "#";
});

const target = computed((): string | undefined => {
  if (props.file.isDirectory()) return;
  return "_blank";
});

const contentSize = computed((): string | undefined => {
  if (props.file.isParentDirectory()) return;

  const size = props.file.size() ?? 0;
  return `${size} ${!size || size > 1 ? "items" : "item"}`;
});

const elapsedTime = computed((): string | undefined => {
  if (props.file.isParentDirectory()) return;

  const updatedAt = props.file.updatedAt()?.getTime();
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
});

const open = (force = false) => {
  if (!force && !props.file.isDirectory()) return;
  directoryCtrl?.openfile(props.file);
};

const checkRenameValue = () => {
  isValidFilename(renameProps.value);
};

const rename = ref<HTMLInputElement | undefined>(undefined);
const onStartRename = () => {
  renameProps.active = true;
  nextTick(() => rename.value?.focus());
};

const onSubmitRename = () => {
  const renameValue = renameProps.value;
  if (isValidFilename(renameValue)) {
    directoryCtrl?.renameFile(props.file, renameValue);
  }

  resetRename();
};

const isValidFilename = (name: string): boolean => {
  renameProps.error = FileData.checkName(name) ?? "";
  const directory = directoryCtrl?.getDirectory();
  if (!renameProps.error && directory?.exists(name)) {
    renameProps.error = "This filename already exists";
  }

  return !renameProps.error;
};

const resetRename = () => {
  renameProps.active = false;
  renameProps.value = "";
  renameProps.error = "";
};

const onOpenContextMenu = () => {
  if (props.file.isParentDirectory()) return;
  showCtxMenu.value = true;
};

const onCloseContextMenu = () => {
  showCtxMenu.value = false;
};

const onClickContextMenu = (action: string) => {
  const actions: { [key: string]: () => void } = {
    delete: () => (showDialog.value = true),
    rename: () => onStartRename(),
    open: () => open(true),
  };

  actions[action]();
  onCloseContextMenu();
};

const onSubmitDeletion = () => {
  directoryCtrl?.deleteFile(props.file);
  onCancelDeletion();
};

const onCancelDeletion = () => {
  showDialog.value = false;
};
</script>

<template>
  <tr
    :class="{
      highlight: highlight || renameProps.active,
      'parent-dir': file.isParentDirectory(),
      'no-hover': noHover,
      reveal: file.new,
    }"
    @click="file.isParentDirectory() && open()"
    @mouseup.right="onOpenContextMenu()"
    @contextmenu.prevent
  >
    <td class="filename" :class="{ error: renameProps.error }">
      <i v-if="file.isParentDirectory()" class="bx bx-arrow-back"></i>
      <i v-else-if="file.isDirectory()" class="bx bxs-folder"></i>
      <i v-else class="bx bx-file-blank"></i>
      <a
        v-if="!renameProps.active && !file.isParentDirectory()"
        :href="href"
        :target="target"
        @click="open()"
      >
        {{ file.name }}
      </a>
      <input
        ref="rename"
        v-show="!file.isParentDirectory() && renameProps.active"
        v-model="renameProps.value"
        :placeholder="file.name"
        @keydown.enter="onSubmitRename"
        @keydown.esc="resetRename"
        @input="checkRenameValue"
        @blur="resetRename"
      />

      <div class="error-message" v-if="renameProps.error">
        {{ renameProps.error }}
      </div>
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
      v-if="showDialog"
      :context="file"
      @submit="onSubmitDeletion"
      @cancel="onCancelDeletion"
    />
  </tr>
</template>

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

  @keyframes reveal {
    from {
      background-color: var(--color-accent);
    }

    to {
      background-color: none;
    }
  }

  &.reveal {
    animation-name: reveal;
    animation-duration: $fib-1 * 1s;
    animation-timing-function: ease-in;
  }

  &.target {
    @extend .shadow-box;
    background: var(--color-button);
    z-index: 1;
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
