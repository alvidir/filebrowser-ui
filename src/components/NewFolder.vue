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
        <span><i class="bx bxs-folder-plus"></i>&nbsp; Add a new folder</span>
        <small>
          It will be created at
          <a :href="href()" target="_blank">{{ pathname() }}</a>
        </small>
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

<script lang="ts">
import { defineComponent, inject } from "vue";
import { FieldController } from "vue-fields/src/main";
import Directory from "@/domain/directory";
import FileData, { Flag } from "@/domain/file";
import Path from "@/domain/path";
import { rootDirName } from "./DirList.vue";

interface DirectoryCtrl {
  getDirectory: () => Directory | undefined;
  addFile: (file: FileData) => void;
}

export default defineComponent({
  name: "NewFolder",

  setup() {
    return {
      directoryCtrl: inject<DirectoryCtrl>("directoryCtrl"),
    };
  },

  data() {
    return {
      active: false,
      valid: false,
      error: "",
    };
  },

  methods: {
    href(): string {
      const directory = this.directoryCtrl?.getDirectory();
      return Path.sanatize(directory?.path ?? "");
    },

    pathname(): string {
      const directory = this.directoryCtrl?.getDirectory();
      if (directory?.isRoot()) return rootDirName;
      else return directory?.path ?? "";
    },

    currentDirectory(): Directory | undefined {
      return this.directoryCtrl?.getDirectory();
    },

    open() {
      this.active = true;
      this.$nextTick(() => {
        const field = this.$refs.foldername as FieldController;
        field?.focus();
      });
    },

    onInput(ctrl: FieldController) {
      const foldername = ctrl.value();
      const directory = this.directoryCtrl?.getDirectory();

      if (!directory) return;

      this.error = FileData.checkName(foldername, directory) ?? "";
      this.valid = !this.error;
    },

    close() {
      const field = this.$refs.foldername as FieldController;
      field?.clear();
      field?.blur();

      this.active = false;
      this.valid = false;
      this.error = "";
    },

    submit() {
      const field = this.$refs.foldername as FieldController;
      const foldername = field.value();
      this.close();

      const directory = this.directoryCtrl?.getDirectory();
      if (!directory) return;

      if (FileData.checkName(foldername, directory)) return;
      const file = new FileData("", foldername, directory);
      file.flags |= Flag.Directory;

      this.directoryCtrl?.addFile(file);
    },
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

    i {
      color: var(--color-text-secondary);
    }

    button.submit {
      width: fit-content;
    }
  }
}
</style>
