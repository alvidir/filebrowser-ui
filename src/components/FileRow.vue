<script setup lang="ts">
import { defineProps, computed, ref, reactive, nextTick } from "vue";
import { File, getSize, getUrl, isDirectory } from "@/file";
import ConfirmDeletion from "@/components/ConfirmDeletion.vue";
import FileTag from "@/components/FileTag.vue";
import { useFileStore } from "@/stores/file";

const fileStore = useFileStore();

interface Props {
  file: File;
  pathname: string;
  highlight?: boolean;
  reveal?: boolean;
  noHover?: boolean;
}

const props = defineProps<Props>();

const fetching = ref(false);
const showCtxMenu = ref(false);
const showDialog = ref(false);
const renameData = reactive({
  active: false,
  error: "",
  value: "",
});

const href = computed((): string | undefined => {
  if (isDirectory(props.file)) return;
  return getUrl(props.file);
});

const target = computed((): string | undefined => {
  if (isDirectory(props.file)) return;
  return "_blank";
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
  cancelRename();
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

const onClickContextMenu = (action: string) => {
  const actions: { [key: string]: () => void } = {
    delete: () => (showDialog.value = true),
    rename: () => activeRename(),
    open: () => open(true),
  };

  actions[action]();
  closeContextMenu();
};

const submitDeletion = () => {
  directoryStore.deleteFile(props.file);
  cancelDeletion();
};

const cancelDeletion = () => {
  showDialog.value = false;
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
      <a v-else :href="href" :target="target" @click="open()">
        {{ file.name }}
      </a>

      <div class="error-message" v-if="renameData.error">
        {{ renameData.error }}
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
      <span v-if="file.size() !== undefined"> {{ printContentSize() }} </span>
      <span v-else>&nbsp;</span>
    </td>
    <td class="elapsed-time">
      <span v-if="file.updatedAt()">{{ elapsedTime }}</span>
    </td>
    <context-menu :active="showCtxMenu" @close="closeContextMenu">
      <button @click="onClickContextMenu('open')">Open</button>
      <button @click="onClickContextMenu('rename')">Rename</button>
      <button class="danger" @click="onClickContextMenu('delete')">
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
