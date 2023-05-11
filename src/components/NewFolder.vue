<script setup lang="ts">
import { ref, nextTick, defineProps } from "vue";
import { Field } from "vue-fields/src/types";
import { File, intoDirectory } from "@/file";
import { useFileStore } from "@/stores/file";
import * as rpc from "@/services/filebrowser.rpc";
import { Warning } from "@/warning";
import { useWarningStore } from "@/stores/warning";
import ActionHeader from "@/components/ActionHeader.vue";

const fileStore = useFileStore();
const warningStore = useWarningStore();

interface Props {
  pathname: string;
}

const props = defineProps<Props>();

const active = ref(false);
const valid = ref(false);
const error = ref<string | undefined>();
const fetching = ref(false);

const foldername = ref<Field | undefined>(undefined);

const activate = () => {
  active.value = true;
  nextTick(() => foldername.value?.focus());
};

const onInput = () => {
  valid.value = false;

  const name = foldername.value?.text() ?? "";
  error.value = fileStore.check(props.pathname, name);

  valid.value = !error.value;
};

const cancel = () => {
  foldername.value?.clear();
  foldername.value?.blur();

  active.value = false;
  valid.value = false;
  error.value = undefined;
};

const submit = () => {
  if (!valid.value) return;
  fetching.value = true;

  rpc
    .createFile(
      intoDirectory({
        id: "",
        name: foldername.value?.text() ?? "",
        directory: props.pathname,
        metadata: new Map(),
        permissions: new Map(),
        flags: 0,
        isNew: true,
      })
    )
    .then((file: File) => {
      fileStore.addFile(file);
    })
    .catch((error: Warning) => {
      warningStore.push(error);
    })
    .finally(() => {
      fetching.value = false;
      cancel();
    });
};
</script>

<template>
  <div
    class="new-folder-dialog"
    v-click-outside="cancel"
    @keydown.enter="submit"
  >
    <regular-button :active="active" @click="activate">
      <i class="bx bxs-folder-plus"></i>
      New folder
    </regular-button>
    <regular-card :class="{ active: active }" @close="cancel" closable>
      <template #header>
        <action-header
          title="Add a new folder"
          subtitle="It will be created at"
          :pathname="pathname"
          :href="pathname"
          icon="bx bxs-folder-plus"
        ></action-header>
      </template>
      <regular-field
        ref="foldername"
        placeholder="folder name"
        :error="error"
        :disabled="fetching"
        @input="onInput"
        large
      ></regular-field>
      <template #footer>
        <submit-button :disabled="!valid" :loading="fetching" @submit="submit">
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
