<template>
  <dialog-card class="action-dialog" :active="active" @close="onCancelClick">
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
      <submit-button color="var(--color-red)" @submit="onSubmitClick">
        Delete
      </submit-button>
      <regular-button @click="onCancelClick">Cancel</regular-button>
    </template>
  </dialog-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import ActionHeader from "@/components/ActionHeader.vue";
import FileData from "@/domain/file";
import Path from "@/domain/path";

const SUBMIT_EVENT_NAME = "submit";
const CANCEL_EVENT_NAME = "cancel";

export default defineComponent({
  name: "ConfirmDeletion",
  events: [SUBMIT_EVENT_NAME, CANCEL_EVENT_NAME],
  components: {
    ActionHeader,
  },
  props: {
    active: Boolean,
    context: {
      type: Object as PropType<FileData>,
      required: true,
    },
  },

  computed: {
    href(): string | undefined {
      if (this.context.isDirectory()) {
        return new Path(this.context.path()).absolute;
      }

      return this.context.url();
    },

    contentSize(): string | undefined {
      const size = this.context.size() ?? 0;
      if (size) return `${size} ${size > 1 ? "items" : "item"}`;
      else return "empty";
    },

    description(): string {
      let description = "";
      if (this.context.isDirectory()) {
        description = `You are about to delete a folder and the ${this.contentSize} inside of it.`;
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
