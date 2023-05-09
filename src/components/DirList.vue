<script setup lang="ts">
import { reactive, defineProps, computed } from "vue";
import FileRow from "@/components/FileRow.vue";
import { File, getTags, isDirectory } from "@/file";
import { Tag } from "@/tag";
import { useFileStore } from "@/stores/file";
import * as rpc from "@/services/filebrowser.rpc";
import { display, split } from "@/path";
import urlJoin from "url-join";

const maxRoutesLength = 34;
const fileStore = useFileStore();

interface Props {
  pathname: string;
}

const props = defineProps<Props>();

interface Events {
  (e: "changeDir", pathname: string, payload: MouseEvent): void;
  (e: "open", file: File, payload: MouseEvent): void;
}

const emit = defineEmits<Events>();

const drag = reactive({
  source: undefined as string | undefined,
  target: undefined as string | undefined,
});

const files = computed((): Array<string> => {
  return fileStore.getDirectory(props.pathname);
});

const routes = computed((): Array<{ name: string; absolute: string }> => {
  const allRoutes = split(display(props.pathname)).map(
    (route, index, array) => {
      return {
        name: route,
        absolute: urlJoin(array.slice(0, index + 1)),
      };
    }
  );

  let index: number;
  let cumulativeLength = 0;
  for (
    index = allRoutes.length;
    index > 0 && cumulativeLength < maxRoutesLength;
    index--
  ) {
    cumulativeLength += allRoutes[index - 1].name.length;
  }

  return allRoutes.slice(allRoutes.length - index);
});

const onDragMode = computed((): boolean => {
  return !!drag.source;
});

const belongsToDrag = (file: File) => {
  return drag.source === file.id || drag.target === file.id;
};

const onDragStart = (file: File) => {
  drag.source = file.id;
  drag.target = undefined;
};

const onDragExit = (file: File, event: DragEvent) => {
  if (file.id === drag.target && event.buttons) {
    drag.target = undefined;
  }
};

const onDragEnter = (file: File) => {
  if (file.id !== drag.source && isDirectory(file)) {
    drag.target = file.id;
  }
};

const onDragEnd = () => {
  //   const source = drag.source ? fileStore.getFile(drag.source) : undefined;
  //   drag.source = undefined;
  //   const target = drag.target ? fileStore.getFile(drag.target) : undefined;
  //   drag.target = undefined;
  //   if (!source || !target || source.id === target.id) return;
  //   const targetDir = isDirectory(source) ? source.name : "";
  //   const targetPath = target.isParentDirectory()
  //     ? target.directory
  //     : urlJoin(target.directory, target.name);
  //   const dest = Path.asDirectory(Path.sanatize(urlJoin(targetPath, targetDir)));
  //   rpc.moveFile(fileStore.getFile(source), fileStore.getFile(target));
};

const isDraggable = (file: File): boolean => {
  return !getTags(file).includes(Tag.Virtual);
};
</script>

<template>
  <div class="dir-list">
    <div class="header round-corners top-only">
      <div class="path-nav">
        <i class="bx bxs-folder-open"></i>
        <button
          v-for="(route, index) in routes"
          :key="index"
          @click="emit('changeDir', route.absolute, $event)"
        >
          {{ route.name }}
        </button>
      </div>
    </div>
    <div class="table-wrapper round-corners bottom-only">
      <table @dragend="onDragEnd()">
        <file-row
          v-if="files.length"
          v-for="file in files"
          :file="fileStore.getFile(file)"
          :key="file"
          :draggable="isDraggable(file)"
          :highlight="belongsToDrag(file)"
          :no-hover="onDragMode"
          @dragstart="onDragStart(file)"
          @dragenter="onDragEnter(file)"
          @dragexit="onDragExit(file, $event)"
          @open="(file: File, payload: MouseEvent) => emit('open', file, payload)"
        />
        <tr v-else>
          <td class="empty">
            <i class="bx bx-search-alt"></i>
            <strong>Nothing to display</strong>
          </td>
        </tr>
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
