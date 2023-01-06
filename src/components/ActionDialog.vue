<template>
  <dialog-card
    class="action-dialog"
    :active="active"
    :class="{ 'custom-color': !!color }"
    @close="onCancelClick"
  >
    <template #header>
      <span>
        <i v-if="iconClass" :class="iconClass"></i>
        &nbsp; {{ title }}
      </span>
      <small>
        {{ subtitle }}
        <a href="#">{{ path }}</a>
      </small>
      <small></small>
    </template>
    {{ description }}
    <template #footer>
      <submit-button :color="color" @submit="onSubmitClick">{{
        buttonTitle
      }}</submit-button>
      <regular-button @click="onCancelClick">Cancel</regular-button>
    </template>
  </dialog-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { File } from "./DirList.vue";
import * as constants from "../constants";

export const SUBMIT_EVENT_NAME = "submit";
export const CANCEL_EVENT_NAME = "cancel";

export default defineComponent({
  name: "ActionDialog",
  events: [SUBMIT_EVENT_NAME, CANCEL_EVENT_NAME],
  props: {
    path: String,
    action: String,
    context: Object as PropType<File>,
    active: Boolean,
  },
  computed: {
    color(): string {
      return this.action ? constants.DIALOGS_PROPS[this.action].color : "";
    },

    iconClass(): string {
      return this.action ? constants.DIALOGS_PROPS[this.action].iconClass : "";
    },

    title(): string {
      return this.action ? constants.DIALOGS_PROPS[this.action].title : "";
    },

    subtitle(): string {
      return this.action ? constants.DIALOGS_PROPS[this.action].subtitle : "";
    },

    buttonTitle(): string {
      if (!this.action) return "";
      return this.action.charAt(0).toUpperCase() + this.action.slice(1);
    },

    description(): string {
      if (!this.action) return "";

      const descriptions: { [key: string]: () => string } = {
        [constants.DIALOGS.DELETE]: this.onDeletionDescription,
      };

      return descriptions[this.action]();
    },
  },

  methods: {
    onDeletionDescription(): string {
      if (!this.context) return "";

      let description = "";
      if (this.context.isDir) {
        description = `You are about to delete a folder and the ${this.context.size?.value} ${this.context.size?.unit} inside of it.`;
      } else {
        description = "You are about to delete a file.";
      }

      return `${description} Be aware that this action is permanent and cannot be undone.`;
    },

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
}
</style>
