<template>
  <div class="new-project-dialog" v-click-outside="close">
    <submit-button color="var(--color-accent)" @click="open">
      <i class="bx bxs-bulb"></i>
      New project
    </submit-button>
    <regular-card :class="{ active: active }" @close="close" closable>
      <template #header>
        <action-header
          title="Start building your new project"
          title-color="var(--color-accent)"
          subtitle="It will be created at"
          :path="pathname"
          :href="href"
          icon="bx bxs-bulb"
        ></action-header>
      </template>
      <div class="apps">
        <button
          v-for="tool in tools"
          :key="tool.name"
          :disabled="isPending(tool)"
          class="app"
          @click="onClick(tool)"
        >
          <i v-if="!isPending(tool)" :class="tool.icon" :alt="tool.name"></i>
          <pulse-loader
            v-if="isPending(tool)"
            class="loader"
            color="var(--color-border-active)"
            :size="'8px'"
            :radius="'5px'"
          ></pulse-loader>
          <span>{{ capitalize(tool.name) }}</span>
        </button>
      </div>
    </regular-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, inject } from "vue";
import PulseLoader from "vue-spinner/src/PulseLoader.vue";
import Tool from "@/domain/tool";
import Directory from "@/domain/directory";
import FileData from "@/domain/file";
import Path from "@/domain/path";
import { rootDirName } from "@/components/DirList.vue";
import ActionHeader from "@/components/ActionHeader.vue";
import Subject from "@/controllers/observer";

const DefaultFilename = "Untitled project";

interface DirectoryCtrl extends Subject {
  getDirectory: () => Directory | undefined;
  create: (file: FileData) => void;
}

export default defineComponent({
  name: "NewFolder",
  components: {
    ActionHeader,
    PulseLoader,
  },
  props: {
    tools: {
      type: Array as PropType<Array<Tool>>,
      default: Tool.all(),
    },
  },

  setup() {
    return {
      directoryCtrl: inject<DirectoryCtrl>("directoryCtrl"),
    };
  },

  data() {
    return {
      active: false,
      directory: undefined as Directory | undefined,
      pending: new Array<FileData>(),
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
    capitalize(word: string) {
      return word[0].toUpperCase() + word.substring(1).toLowerCase();
    },

    isPending(tool: Tool) {
      return this.pending.some((file) => file.tool() == tool);
    },

    onClick(tool: Tool) {
      if (!this.directory) return;

      const file = new FileData("", DefaultFilename, this.directory);
      file.setTool(tool);

      this.pending.push(file);
      this.directoryCtrl?.create(file);
    },

    open() {
      this.directory = this.directoryCtrl?.getDirectory();
      this.active = true;
    },

    close() {
      this.active = false;
    },

    update() {
      if (!this.pending.length) return;

      this.pending.forEach((file) => {
        if (!file.id || !file.directory.files.includes(file)) return;

        const url = file.url();
        if (url) window.open(url, "_blank")?.focus();

        const index = this.pending.indexOf(file);
        this.pending.splice(index, 1);
      });
    },
  },

  mounted() {
    this.directoryCtrl?.addObserver(this);
  },

  unmounted() {
    this.directoryCtrl?.removeObserver(this);
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

.new-project-dialog {
  position: relative;

  .apps {
    display: grid;
    position: relative;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: $fib-6 * 1px;
  }

  button.app {
    @extend .round-corners;

    display: flex;
    flex-direction: column;
    justify-content: center;
    color: var(--color-text-primary);
    aspect-ratio: 1;
    background: transparent;

    &:not(:hover) {
      border: none;
    }

    &:hover {
      border: 1px solid var(--color-border);
    }

    &:focus,
    &.off {
      border: 1px solid var(--color-border-active);
    }

    & > .loader {
      display: flex;
      justify-content: center;
      align-items: center;
      height: $fib-8 * 1px;
    }

    i {
      font-size: $fib-8 * 1px;
    }

    span {
      margin-top: $fib-6 * 1px;
    }
  }

  .regular-card {
    @extend .shadow-box;

    position: absolute;
    margin-top: $fib-5 * 1px;
    min-width: $fib-13 * 1px;
    visibility: hidden;
    border-color: var(--color-accent);

    &.active {
      visibility: visible;
    }
  }
}
</style>
