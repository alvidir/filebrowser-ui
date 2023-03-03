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

<script lang="ts">
import { defineComponent, inject } from "vue";
import { FieldController } from "vue-fields/src/main";
import Directory from "@/domain/directory";
import FileData, { Flag } from "@/domain/file";
import Path from "@/domain/path";
import { rootDirName } from "@/components/DirList.vue";
import ActionHeader from "@/components/ActionHeader.vue";

interface DirectoryCtrl {
  getDirectory: () => Directory | undefined;
  addFile: (file: FileData) => void;
}

export default defineComponent({
  name: "NewFolder",
  components: {
    ActionHeader,
  },

  setup() {
    return {
      directoryCtrl: inject<DirectoryCtrl>("directoryCtrl"),
    };
  },

  data() {
    return {
      directory: undefined as Directory | undefined,
      active: false,
      valid: false,
      error: "",
    };
  },

  computed: {
    href(): string {
      return Path.sanatize(this.directory?.path ?? "");
    },

    pathname(): string {
      if (this.directory?.isRoot()) return rootDirName;
      else return this.directory?.path ?? "";
    },
  },

  methods: {
    open() {
      this.active = true;
      this.directory = this.directoryCtrl?.getDirectory();
      this.$nextTick(() => {
        const field = this.$refs.foldername as FieldController;
        field?.focus();
      });
    },

    onInput(ctrl: FieldController) {
      const foldername = ctrl.value();
      if (!this.directory) return;

      this.error = FileData.checkName(foldername, this.directory) ?? "";
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

      if (!this.directory) return;

      if (FileData.checkName(foldername, this.directory)) return;
      const file = new FileData("", foldername, this.directory);
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
