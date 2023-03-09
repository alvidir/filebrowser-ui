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
          v-for="app in apps"
          :key="app.name"
          :disabled="isPending(app)"
          class="app"
          @click="onClick(app)"
        >
          <i v-if="!isPending(app)" :class="app.icon" :alt="app.name"></i>
          <pulse-loader
            v-if="isPending(app)"
            class="loader"
            color="var(--color-border-active)"
            :size="'8px'"
            :radius="'5px'"
          ></pulse-loader>
          <span>{{ capitalize(app.name) }}</span>
        </button>
      </div>
    </regular-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, inject } from "vue";
import PulseLoader from "vue-spinner/src/PulseLoader.vue";
import App from "@/domain/app";
import Directory from "@/domain/directory";
import FileData from "@/domain/file";
import Path from "@/domain/path";
import { rootDirName } from "@/components/DirList.vue";
import ActionHeader from "@/components/ActionHeader.vue";
import Subject from "@/controllers/observer";

const DefaultFilename = "Untitled project";

interface DirectoryCtrl extends Subject {
  getDirectory: () => Directory | undefined;
  createFile: (file: FileData) => void;
}

export default defineComponent({
  name: "NewFolder",
  components: {
    ActionHeader,
    PulseLoader,
  },
  props: {
    apps: {
      type: Array as PropType<Array<App>>,
      default: App.all(),
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
      return new Path(this.directory?.path ?? "").absolute;
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

    isPending(app: App) {
      return this.pending.some((file) => file.app() == app);
    },

    onClick(app: App) {
      if (!this.directory) return;

      const file = new FileData("", DefaultFilename, this.directory.path);
      file.setTool(app);

      this.pending.push(file);
      this.directoryCtrl?.createFile(file);
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
        if (!file.id || !this.directory?.files.includes(file)) return;

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
