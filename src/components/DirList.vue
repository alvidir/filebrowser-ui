<script setup lang="ts">
import { reactive, defineProps, computed } from "vue";
import FileRow from "@/components/FileRow.vue";
import { File } from "@/file";
import * as path from "@/path";
import { Tag, tags, getTag } from "@/tag";

interface Props {
  pathname: string;
}

const props = defineProps<Props>();

const drag = reactive({
  source: undefined as number | undefined,
  target: undefined as number | undefined,
});

const files = computed((): Array<File> => {
  const baseFiles = directoryStore.path === pathSeparator ? [] : [parentdir];
  const dirFiles = filterStore.filterFiles(directoryStore.files ?? []);
  return baseFiles.concat(dirFiles);
});

const directories = computed((): Array<string> => {
  const components = directoryStore.path
    .split(pathSeparator)
    .filter((path) => path.length);

  let allDirs = [rootDirName].concat(components);

  let maxDirs = 1;
  let totalLength = 0;
  for (let index = allDirs.length; index > 0; index--) {
    if (totalLength + allDirs[index - 1].length > props.maxDirsLength) {
      break;
    }

    totalLength += allDirs[index - 1].length;
    maxDirs++;
  }

  return [rootDirName].concat(components).slice(-maxDirs);
});

const onDragMode = computed((): boolean => {
  return !!drag.source;
});

const belongsToDrag = (item: FileData) => {
  return drag.source?.name === item.name || drag.target?.name === item.name;
};

const onDragStart = (item: FileData) => {
  drag.source = item;
  drag.target = undefined;
};

const onDragExit = (item: FileData, event: DragEvent) => {
  if (item.name === drag.target?.name && event.buttons) {
    drag.target = undefined;
  }
};

const onDragEnter = (item: FileData) => {
  if (item.name !== drag.source?.name && item.isDirectory()) {
    drag.target = item;
  }
};

const onDragEnd = () => {
  if (drag.source && drag.target) {
    directoryStore.moveFile(drag.source, drag.target);
  }

  drag.source = undefined;
  drag.target = undefined;
};

const onDirectoryClick = (index: number) => {
  const delta = directories.value.length - 1 - index;
  if (delta) directoryStore.changeDirectory(-delta);
};

const isDraggable = (item: FileData): boolean => {
  return (
    item.name !== parentDirName &&
    !item.tags().includes((tag: Tag) => tag.name == Tags.Virtual)
  );
};
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
        <tr v-if="directoryStore.path === pathSeparator && !files.length">
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
