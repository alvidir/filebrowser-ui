<script setup lang="ts">
import { defineProps, ref, reactive, computed } from "vue";
import PulseLoader from "vue-spinner/src/PulseLoader.vue";
import App from "@/domain/app";
import FileData from "@/domain/file";
import Path, { pathSeparator, rootDirName } from "@/domain/path";
import ActionHeader from "@/components/ActionHeader.vue";
import { useDirectoryStore } from "@/stores/directory";

const directoryStore = useDirectoryStore();

interface Props {
  apps: Array<App>;
}

defineProps<Props>();

const active = ref(false);
const pending = reactive(new Array<FileData>());

const href = computed((): string => {
  return Path.sanatize(directoryStore.path ?? "");
});

const pathname = computed((): string => {
  if (directoryStore.path === pathSeparator) return rootDirName;
  else return directoryStore.path ?? "";
});

const capitalize = (word: string) => {
  return word[0].toUpperCase() + word.substring(1).toLowerCase();
};

const isPending = (app: App) => {
  return pending.some((file) => {
    return file.app() == app;
  });
};

const onClick = (app: App) => {
  if (!directoryStore) return;

  const file = new FileData("", "", directoryStore.path);
  file.setApp(app);

  const index = pending.push(file);
  directoryStore.createFile(file)?.then(() => {
    pending.splice(index - 1, 1);
  });
};

const open = () => {
  active.value = true;
};

const close = () => {
  active.value = false;
};
</script>

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

    &:active,
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
