<template>
  <dialog-card
    class="action-dialog"
    :active="!!context"
    :class="{ 'custom-color': !!color }"
    @close="onCancelClick"
  >
    <template #header>
      <span>
        <i class="bx bxs-castle"></i>
        &nbsp; Needs confirmation
      </span>
      <small>
        Delete action on
        <a :href="context?.url()" target="_blank">{{ context?.filename() }}</a>
      </small>
      <small></small>
    </template>
    {{ description }}
    <template #footer>
      <submit-button :color="color" @submit="onSubmitClick">
        Delete
      </submit-button>
      <regular-button @click="onCancelClick">Cancel</regular-button>
    </template>
  </dialog-card>
</template>

<script lang="ts">
import FileData from "@/domain/file";
import { defineComponent, PropType } from "vue";

const SUBMIT_EVENT_NAME = "submit";
const CANCEL_EVENT_NAME = "cancel";

export default defineComponent({
  name: "ConfirmDeletion",
  events: [SUBMIT_EVENT_NAME, CANCEL_EVENT_NAME],
  props: {
    context: Object as PropType<FileData>,
  },

  computed: {
    color(): string {
      return "var(--color-red)";
    },

    description(): string {
      if (!this.context) return "";

      let description = "";
      if (this.context?.isDirectory()) {
        description = `You are about to delete a folder and the ${this.context.size()} items inside of it.`;
      } else {
        description = "You are about to delete a file.";
      }

      return `${description} Be aware that this action is permanent and cannot be undone.`;
    },
  },

  methods: {
    onCancelClick() {
      this.$emit(CANCEL_EVENT_NAME);
    },

    onSubmitClick() {
      this.$emit(SUBMIT_EVENT_NAME);
    },
  },
});
</script>

<style lang="scss">
@import "fibonacci-styles";

$text-color: v-bind(color);

.action-dialog {
  button.submit {
    width: fit-content;
    margin-right: $fib-6 * 1px;
  }

  span {
    font-size: large;
  }

  &.custom-color {
    label {
      color: $text-color;
    }

    .regular-card {
      border-color: $text-color;

      span {
        color: $text-color;
      }
    }
  }

  .regular-field {
    min-width: $fib-13 * 1px;
  }
}
</style>
