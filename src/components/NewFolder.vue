<script setup lang="ts">
import { ref, nextTick } from "vue";
import { intoDirectory } from "@/file";
import { useFileStore } from "@/stores/file";
import ActionHeader from "@/components/ActionHeader.vue";
import urlJoin from "url-join";

const fileStore = useFileStore();

interface Props {
  pathname: string;
}

const props = defineProps<Props>();

const active = ref(false);
const valid = ref(false);
const error = ref<string | undefined>();
const fetching = ref(false);

interface Field {
  focus: () => void;
  blur: () => void;
}

const field = ref<Field | undefined>();
const foldername = ref("");

const activate = () => {
  active.value = true;
  nextTick(() => field.value?.focus());
};

const onInput = () => {
  valid.value = false;

  const name = foldername.value.trim() ?? "";
  error.value = fileStore.check(props.pathname, name);

  valid.value = !error.value;
};

const cancel = () => {
  foldername.value = "";
  field.value?.blur();

  active.value = false;
  valid.value = false;
  error.value = undefined;
};

const submit = () => {
  if (!valid.value) return;
  active.value = false;

  const name = foldername.value.trim() ?? "";
  cancel();

  fileStore.addFile(
    intoDirectory({
      id: urlJoin(props.pathname, name),
      name: name,
      directory: props.pathname,
      metadata: new Map(),
      permissions: new Map(),
      flags: 0,
      isNew: true,
    })
  );
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
        v-model="foldername"
        ref="field"
        placeholder="folder name"
        :error="error"
        :readonly="fetching"
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
