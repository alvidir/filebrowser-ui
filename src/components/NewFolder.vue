<template>
  <div class="new-folder-dialog" v-click-outside="close">
    <regular-button :active="active" @click="open">
      <i class="bx bxs-folder-plus"></i>
      {{ NEW_FOLDER }}
    </regular-button>
    <regular-card :class="{ active: active }" @close="close" closable>
      <template #header>
        <span><i class="bx bxs-folder-plus"></i>&nbsp; Add a new folder</span>
        <small>
          It will be created at
          <a href="#">{{ path }}</a>
        </small>
      </template>
      <regular-field
        placeholder="folder name"
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

export const SUBMIT_EVENT_NAME = "submit";

const NEW_FOLDER = "New folder";
type ValidateFn = (name: string) => string;

export default defineComponent({
  name: "NewFolder",
  events: [SUBMIT_EVENT_NAME],
  props: {
    path: String,
    validate: Function as PropType<ValidateFn>,
  },

  setup() {
    return {
      NEW_FOLDER,
    };
  },

  data() {
    return {
      active: false,
      valid: false,
      folderName: "",
      error: "",
    };
  },

  computed: {
    isValid(): boolean {
      return this.folderName.length > 0 && this.error.length == 0;
    },
  },

  methods: {
    open() {
      this.active = true;
    },

    onFolderNameInput(name: string) {
      const separator = constants.PATH_SEPARATOR;
      this.folderName = name.trim();
      this.error = "";

      if (name.includes(separator)) {
        this.error = `A folder cannot contains a "${separator}" in its name"`;
        return;
      }

      if (this.validate) {
        this.error = this.validate(this.folderName);
      }
    },

    close() {
      this.active = false;
    },

    submit() {
      this.$emit(SUBMIT_EVENT_NAME, this.folderName);
      this.close();
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

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
</style>
