<script setup lang="ts">
import { defineProps, computed, ref, reactive, nextTick } from "vue";
import ConfirmDeletion from "@/components/ConfirmDeletion.vue";
import FileTag from "@/components/FileTag.vue";
import { useFileStore } from "@/stores/file";
import { useWarningStore } from "@/stores/warning";
import * as rpc from "@/services/filebrowser.rpc";
import { Warning } from "@/warning";
import { findTag } from "@/tag";
import { timeElapsedSince } from "@/time";
import {
  File,
  getSize,
  getUrl,
  getTags,
  isDirectory,
  getUpdatedAt,
} from "@/file";

const fileStore = useFileStore();
const warningStore = useWarningStore();

interface Props {
  file: File;
  pathname: string;
  highlight?: boolean;
  reveal?: boolean;
  noHover?: boolean;
}

const props = defineProps<Props>();

interface Events {
  (e: "open", file: File, payload: MouseEvent): void;
}

const emit = defineEmits<Events>();

const fetching = ref(false);
const showCtxMenu = ref(false);
const showDialog = ref(false);
const renameData = reactive({
  active: false,
  error: "",
  value: "",
});

const contentSize = computed((): string => {
  const size = getSize(props.file) ?? 0;
  return `${size} ${!size || size > 1 ? "items" : "item"}`;
});

const renameInput = ref<HTMLInputElement | undefined>(undefined);

const activeRename = () => {
  renameData.active = true;
  nextTick(() => renameInput.value?.focus());
};

const onRenameInput = () => {
  const name = renameData.value;
  renameData.error = fileStore.check(props.pathname, name) ?? "";
};

const submitRename = () => {
  if (renameData.error) return;

  const file = props.file;
  fetching.value = true;

  rpc
    .renameFile(file, renameData.value)
    .then(() => {
      fileStore.removeFile(file.id);
      file.name = renameData.value;
      fileStore.addFile(file);
    })
    .catch((error: Warning) => {
      warningStore.push(error);
    })
    .finally(() => {
      fetching.value = false;
      cancelRename();
    });
};

const cancelRename = () => {
  renameData.active = false;
  renameData.value = "";
  renameData.error = "";
};

const onOpenContextMenu = () => {
  showCtxMenu.value = true;
};

const closeContextMenu = () => {
  showCtxMenu.value = false;
};

const onClickContextMenu = (action: string, event: MouseEvent) => {
  const actions: { [key: string]: () => void } = {
    delete: () => (showDialog.value = true),
    rename: () => activeRename(),
    open: () => open(event),
  };

  actions[action]();
  closeContextMenu();
};

const submitDeletion = () => {
  fetching.value = true;

  rpc
    .deleteFile(props.file)
    .then(() => {
      fileStore.removeFile(props.file.id);
    })
    .catch((error: Warning) => {
      warningStore.push(error);
    })
    .finally(() => {
      fetching.value = false;
      cancelDeletion();
    });
};

const cancelDeletion = () => {
  showDialog.value = false;
};

const open = (event: MouseEvent) => {
  emit("open", props.file, event);
};
</script>

<template>
  <tr
    :class="{
      highlight: highlight || renameData.active,
      'no-hover': noHover,
      reveal: file.isNew,
    }"
    @mouseup.right="onOpenContextMenu()"
    @contextmenu.prevent
  >
    <td class="filename" :class="{ error: renameData.error }">
      <i v-if="isDirectory(file)" class="bx bxs-folder"></i>
      <i v-else class="bx bx-file-blank"></i>
      <input
        ref="renameInput"
        v-if="renameData.active"
        v-model="renameData.value"
        :placeholder="file.name"
        @keydown.enter="submitRename"
        @keydown.esc="cancelRename"
        @input="onRenameInput"
        @blur="cancelRename"
      />
      <span v-else-if="isDirectory(file)" @click="open">
        {{ file.name }}
      </span>
      <a v-else :href="getUrl(file)" target="_blank">
        {{ file.name }}
      </a>

      <div class="error-message" v-if="renameData.error">
        {{ renameData.error }}
      </div>
    </td>
    <td>
      <div class="tags-list">
        <file-tag v-for="tag in getTags(file)" :key="tag" v-bind="findTag(tag)">
          {{ tag }}
        </file-tag>
      </div>
    </td>
    <td class="file-size">
      <span v-if="isDirectory(file)"> {{ contentSize }} </span>
      <span v-else>&nbsp;</span>
    </td>
    <td class="elapsed-time">
      <span>{{ timeElapsedSince(getUpdatedAt(file)) }}</span>
    </td>
    <context-menu :active="showCtxMenu" @close="closeContextMenu">
      <button @click="onClickContextMenu('open', $event)">Open</button>
      <button @click="onClickContextMenu('rename', $event)">Rename</button>
      <button class="danger" @click="onClickContextMenu('delete', $event)">
        Remove
      </button>
    </context-menu>
    <confirm-deletion
      v-if="showDialog"
      :file="file"
      @submit="submitDeletion"
      @cancel="cancelDeletion"
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
