<template>
  <div
    class="new-folder-dialog"
    v-click-outside="close"
    @keydown.enter="submit"
  >
    <regular-button :active="active" @click="open">
      <i class="bx bxs-folder-plus"></i>
      {{ NEW_FOLDER }}
    </regular-button>
    <regular-card :class="{ active: active }" @close="close" closable>
      <template #header>
        <span><i class="bx bxs-folder-plus"></i>&nbsp; Add a new folder</span>
        <small>
          It will be created at
          <a href="#">{{ directory }}</a>
        </small>
      </template>
      <regular-field
        placeholder="folder name"
        :ref="FIELD_FOLDERNAME"
        :error="error"
        @input="onFolderNameInput"
      ></regular-field>
      <template #footer>
        <submit-button :disabled="!isValid" @submit="submit">
          Create
        </submit-button>
      </template>
    </regular-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import * as constants from "@/constants";
import { FieldController } from "vue-fields/src/main";

export const SUBMIT_EVENT_NAME = "submit";
export const FIELD_FOLDERNAME = "foldername";

const NEW_FOLDER = "New folder";
type ValidateFn = (name: string) => string;

export default defineComponent({
  name: "NewFolder",
  events: [SUBMIT_EVENT_NAME],
  props: {
    path: { type: String, required: true },
    validate: Function as PropType<ValidateFn>,
  },

  setup() {
    return {
      NEW_FOLDER,
      FIELD_FOLDERNAME,
    };
  },

  data() {
    return {
      active: false,
      field: undefined as FieldController | undefined,
      error: "",
    };
  },

  computed: {
    isValid(): boolean {
      return (
        !!this.field && this.field.value().length > 0 && this.error.length == 0
      );
    },

    directory(): string {
      const dirs = this.path.split(constants.PATH_SEPARATOR);
      return `/${dirs[dirs.length - 1]}`;
    },
  },

  methods: {
    open() {
      this.active = true;
      setTimeout(() => this.field?.focus(), 89); //$fib-10
    },

    onFolderNameInput(ctrl: FieldController) {
      const separator = constants.PATH_SEPARATOR;
      const name = ctrl.value().trim();
      this.error = "";

      if (name.includes(separator)) {
        this.error = `A folder cannot contains a "${separator}" in its name"`;
        return;
      }

      if (this.validate) {
        this.error = this.validate(name);
      }
    },

    close() {
      if (!this.active) return;

      this.active = false;
      this.field?.clear();
      this.field?.blur();
    },

    submit() {
      if (!this.isValid) return;

      this.$emit(SUBMIT_EVENT_NAME, this.field?.value().trim());
      this.close();
    },
  },

  mounted() {
    this.field = this.$refs[FIELD_FOLDERNAME] as FieldController;
  },
});
</script>

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

    a {
      &:not(:hover) {
        color: var(--color-text-secondary);
      }
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
