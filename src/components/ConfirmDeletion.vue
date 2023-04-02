<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";
import ActionHeader from "@/components/ActionHeader.vue";
import FileData from "@/domain/file";
import Path from "@/domain/path";

interface Props {
  context: FileData;
}

const props = defineProps<Props>();

interface Events {
  (e: "submit", payload: MouseEvent): void;
  (e: "cancel", payload: MouseEvent): void;
}

const emit = defineEmits<Events>();
const href = computed((): string | undefined => {
  if (props.context.isDirectory()) {
    return Path.sanatize(props.context.path());
  }

  return props.context.url();
});

const contentSize = computed((): string => {
  const size = props.context.size() ?? 0;
  if (size) return `${size} ${size > 1 ? "items" : "item"}`;
  else return "empty";
});

const description = computed((): string | undefined => {
  let description = "";
  if (props.context.isDirectory()) {
    description = `You are about to delete a folder and the ${contentSize.value} inside of it.`;
  } else {
    description = "You are about to delete a file.";
  }

  return `${description} Be aware that this action is permanent and cannot be undone.`;
});
</script>

<template>
  <dialog-card class="action-dialog" @close="emit('cancel', $event)">
    <template #header>
      <action-header
        title="Needs confirmation"
        title-color="var(--color-red)"
        subtitle="Delete action on"
        :path="context.path()"
        :href="href"
        icon="bx bxs-castle"
      ></action-header>
    </template>
    {{ description }}
    <template #footer>
      <submit-button color="var(--color-red)" @submit="emit('submit', $event)">
        Delete
      </submit-button>
      <regular-button @click="emit('cancel', $event)">Cancel</regular-button>
    </template>
  </dialog-card>
</template>

<style lang="scss">
@import "fibonacci-styles";

$text-color: var(--color-red);

.action-dialog {
  button.submit {
    width: fit-content;
    margin-right: $fib-6 * 1px;
  }

  span {
    font-size: large;
  }

  label {
    color: $text-color;
  }

  .regular-card {
    border-color: $text-color;
  }

  .regular-field {
    min-width: $fib-13 * 1px;
  }
}
</style>
