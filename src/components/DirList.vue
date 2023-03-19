<script setup lang="ts">
import {
  defineProps,
  withDefaults,
  onMounted,
  onUnmounted,
  inject,
  computed,
  ref,
} from "vue";
import FileRow from "@/components/FileRow.vue";
import FileData, { parentDirName } from "@/domain/file";
import { rootDirName } from "@/domain/path";
import Tag, { Tags } from "@/domain/tag";
import Directory from "@/domain/directory";
import { Subject } from "@/controllers/observer";

interface DirectoryCtrl extends Subject {
  getDirectory: () => Directory | undefined;
  changeDirectory: (delta: number) => void;
  moveFile: (source: FileData, target: FileData) => void;
}

interface FilterCtrl extends Subject {
  filter: (files: Array<FileData>) => Array<FileData>;
}

interface Props {
  maxDirsLength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxDirsLength: 55,
});

const directoryCtrl = inject<DirectoryCtrl>("directoryCtrl");
const filterCtrl = inject<FilterCtrl>("filterCtrl");

const currentDirectory = (): Directory | undefined => {
  return directoryCtrl?.getDirectory();
};

const buildParentDirFile = (): FileData => {
  return new FileData("", parentDirName, "");
};

const filteredFiles = (): Array<FileData> => {
  const parentDir = buildParentDirFile();
  if (!directory.value) return [parentDir];

  const baseFiles = directory.value?.isRoot() ? [] : [parentDir];
  const dirFiles = filterCtrl
    ? filterCtrl.filter(directory.value?.files ?? [])
    : directory.value?.files;

  return baseFiles.concat(dirFiles ?? []);
};

let directory = ref(currentDirectory());
let files = ref(filteredFiles());
const drag = {
  source: undefined as FileData | undefined,
  target: undefined as FileData | undefined,
};

const directories = computed((): Array<string> => {
  let allDirs = [rootDirName].concat(directory.value?.pathComponents() ?? []);

  let maxDirs = 1;
  let totalLength = 0;
  for (let index = allDirs.length; index > 0; index--) {
    if (totalLength + allDirs[index - 1].length > props.maxDirsLength) {
      break;
    }

    totalLength += allDirs[index - 1].length;
    maxDirs++;
  }

  return [rootDirName]
    .concat(directory.value?.pathComponents() ?? [])
    .slice(-maxDirs);
});

const onDragMode = computed((): boolean => {
  return !!drag.source;
});

const belongsToDrag = (item: FileData) => {
  return drag.source === item || drag.target === item;
};

const onDragStart = (item: FileData) => {
  drag.source = item;
  drag.target = undefined;
};

const onDragExit = (item: FileData, event: DragEvent) => {
  if (item === drag.target && event.buttons) {
    drag.target = undefined;
  }
};

const onDragEnter = (item: FileData) => {
  if (item !== drag.source && item.isDirectory()) {
    drag.target = item;
  }
};

const onDragEnd = () => {
  if (drag.source && drag.target) {
    directoryCtrl?.moveFile(drag.source, drag.target);
  }

  drag.source = undefined;
  drag.target = undefined;
};

const onDirectoryClick = (index: number) => {
  const delta = directories.value.length - 1 - index;
  if (delta) directoryCtrl?.changeDirectory(-delta);
};

const isDraggable = (item: FileData): boolean => {
  return !item.tags().includes((tag: Tag) => tag.name == Tags.Virtual);
};

const update = () => {
  directory.value = currentDirectory();
  files.value = filteredFiles();
};

onMounted(() => {
  directoryCtrl?.addObserver({ update });
});

onUnmounted(() => {
  directoryCtrl?.removeObserver({ update });
});
</script>

<template>
  <div class="dir-list">
    <div class="header round-corners top-only">
      <div class="path-nav">
        <i class="bx bxs-folder-open"></i>
        <button
          v-for="(dir, index) in directories"
          :key="dir"
          @click="onDirectoryClick(index)"
        >
          {{ dir }}
        </button>
      </div>
    </div>
    <div class="table-wrapper round-corners bottom-only">
      <table @dragend="onDragEnd()">
        <tr v-if="directory?.isRoot() && !directory.files.length">
          <td class="empty">
            <i class="bx bx-search-alt"></i>
            <strong>Nothing to display</strong>
          </td>
        </tr>
        <file-row
          v-for="item in files"
          :file="item"
          :key="item.name"
          :draggable="isDraggable(item)"
          :highlight="belongsToDrag(item)"
          :no-hover="onDragMode"
          @dragstart="onDragStart(item)"
          @dragenter="onDragEnter(item)"
          @dragexit="onDragExit(item, $event)"
        />
      </table>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

.dir-list {
  display: flex;
  flex-direction: column;
}

i {
  font-size: large;
  color: var(--color-text-secondary);
  padding-right: $fib-6 * 1px;
}

.header {
  width: 100%;
  height: $fib-9 * 1px;
  background: var(--color-bg-primary);
  border: 1px solid;
  border-color: var(--color-border);
  box-sizing: border-box;

  .path-nav {
    display: flex;
    align-items: center;
    padding: 0 $fib-6 * 1px;
    height: 100%;

    .directory {
      height: fit-content;
      font-size: medium;
      color: var(--color-text-secondary);
      background: transparent;
      border: none;
    }

    button {
      @extend .directory;

      &:last-child {
        cursor: default;
        color: var(--color-text-primary);
        font-weight: 600;
      }

      &:not(:last-child):hover {
        color: var(--color-accent);
      }

      &:not(:last-child)::after {
        padding: 0 $fib-4 * 1px;
        content: "/";
      }
    }
  }
}

.table-wrapper {
  color: var(--color-text-primary);
  font-size: medium;
  border: 1px solid;
  border-color: var(--color-border);
  box-sizing: border-box;
  overflow: hidden;

  table {
    width: 100%;
    border: none;
    outline: none;
    border-collapse: collapse;
  }

  td.empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: $fib-12 * 1px;
    justify-content: center;
    color: var(--color-text-secondary);
    border-top: 1px solid var(--color-border);
    width: 100%;

    i {
      font-size: xx-large;
      margin-bottom: $fib-5 * 1px;
    }
  }
}
</style>
