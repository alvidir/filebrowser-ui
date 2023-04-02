<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { Field } from "vue-fields/src/types";
import FileData, { Flag } from "@/domain/file";
import Path, { pathSeparator } from "@/domain/path";
import { rootDirName } from "@/domain/path";
import ActionHeader from "@/components/ActionHeader.vue";
import { useDirectoryStore } from "@/stores/directory";

const directoryStore = useDirectoryStore();

const active = ref(false);
const valid = ref(false);
const error = ref("");

const href = computed((): string => {
  return Path.sanatize(directoryStore.path ?? "");
});

const pathname = computed((): string => {
  if (directoryStore.path === pathSeparator) return rootDirName;
  else return directoryStore.path ?? "";
});

const foldername = ref<Field | undefined>(undefined);
const open = () => {
  active.value = true;
  nextTick(() => foldername.value?.focus());
};

const onInput = () => {
  const name = foldername.value?.text() ?? "";
  valid.value = isValidFilename(name);
};

const isValidFilename = (name: string): boolean => {
  error.value = FileData.checkName(name) ?? "";
  if (!error.value && directoryStore.exists(name)) {
    error.value = "This filename already exists";
  }

  return !error.value;
};

const close = () => {
  foldername.value?.clear();
  foldername.value?.blur();

  active.value = false;
  valid.value = false;
  error.value = "";
};

const submit = () => {
  const name = foldername.value?.text() ?? "";
  close();

  if (!isValidFilename(name)) return;
  const file = new FileData("", name, directoryStore.path);
  file.flags |= Flag.Directory;
  file.new = true;

  directoryStore.files.push(file);
};
</script>

<template>
  <div
    class="new-folder-dialog"
    v-click-outside="close"
    @keydown.enter="submit"
  >
    <regular-button :active="active" @click="open">
      <i class="bx bxs-folder-plus"></i>
      New folder
    </regular-button>
    <regular-card :class="{ active: active }" @close="close" closable>
      <template #header>
        <action-header
          title="Add a new folder"
          subtitle="It will be created at"
          :path="pathname"
          :href="href"
          icon="bx bxs-folder-plus"
        ></action-header>
      </template>
      <regular-field
        ref="foldername"
        placeholder="folder name"
        :error="error"
        @input="onInput"
        large
      ></regular-field>
      <template #footer>
        <submit-button :disabled="!valid" @submit="submit">
          Create
        </submit-button>
      </template>
    </regular-card>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

.new-folder-dialog {
  position: relative;

  .regular-card {
    @extend .shadow-box;

    position: absolute;
    margin-top: $fib-5 * 1px;
    min-width: $fib-13 * 1px;
    visibility: hidden;

    &.active {
      visibility: visible;
    }

    i {
      color: var(--color-text-secondary);
    }

    button.submit {
      width: fit-content;
    }
  }
}
</style>
