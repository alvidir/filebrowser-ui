<script setup lang="ts">
import { reactive, computed, ref, watch } from "vue";
import FileRow from "@/components/FileRow.vue";
import { File, getTags, isDirectory } from "@/file";
import { Tag } from "@/tag";
import { useFileStore } from "@/stores/file";
import * as rpc from "@/services/filebrowser.rpc";
import * as path from "@/path";
import { display, split } from "@/path";
import urlJoin from "url-join";
import { getFilesFilter } from "@/filter";
import { useWarningStore } from "@/stores/warning";
import { Warning } from "@/warning";

const maxRoutesLength = 34;
const fileStore = useFileStore();
const warningStore = useWarningStore();

interface Props {
  pathname: string;
}

const props = defineProps<Props>();

interface Events {
  (e: "changeDir", pathname: string, payload: MouseEvent): void;
  (e: "open", file: File, payload: MouseEvent): void;
}

const emit = defineEmits<Events>();

const fetching = ref(false);
const drag = reactive({
  source: undefined as File | undefined,
  target: undefined as File | undefined,
  parent: false,
});

const allFilesById = ref(new Array<string>());

watch(
  () => fileStore.getDirectory(props.pathname),
  (filesById) => (allFilesById.value = filesById)
);

const files = computed((): Array<File> => {
  return getFilesFilter()(
    allFilesById.value.map((id: string) => fileStore.getFile(id))
  );
});

const routes = computed((): Array<{ name: string; absolute: string }> => {
  const allRoutes = split(display(props.pathname)).map(
    (route, index, array) => {
      return {
        name: route,
        absolute: urlJoin(array.slice(1, index + 1)),
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

  return allRoutes.slice(index);
});

const parentPath = computed((): string => {
  return routes.value.at(-2)?.absolute ?? "";
});

const onDragMode = computed((): boolean => {
  return !!drag.source;
});

const belongsToDrag = (file: File) => {
  return drag.source === file || drag.target === file;
};

const onDragStart = (file: File) => {
  drag.target = undefined;
  drag.source = file;
};

const onDragExit = (file: File, event: DragEvent) => {
  if (file === drag.target && event.buttons) {
    drag.target = undefined;
  }
};

const onDragEnter = (file: File) => {
  if (file !== drag.source && isDirectory(file)) {
    drag.target = file;
  }
};

const onDragEnd = () => {
  const source = drag.source;
  const target = drag.target;

  drag.source = undefined;
  drag.target = undefined;

  if (!source || source === target || (!target && !drag.parent)) return;
  drag.parent = false;

  fetching.value = true;
  let destination = parentPath.value;

  if (target)
    destination = path.sanatize(
      urlJoin(
        urlJoin(target.directory, target.name),
        isDirectory(source) ? source.name : ""
      )
    );

  rpc
    .moveFile(source, path.asDirectory(destination))
    .then(() => {
      fileStore.moveFile(source.id, destination);
    })
    .catch((error: Warning) => {
      warningStore.push(error);
    })
    .finally(() => {
      fetching.value = false;
    });
};

const isDraggable = (file: File): boolean => {
  return !getTags(file).includes(Tag.Virtual);
};

const onParentDragExit = (event: MouseEvent) => {
  if (event.buttons) drag.parent = false;
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
      <a
        v-if="routes.length > 1"
        class="parent-dir"
        :class="{ 'drag-target': drag.parent }"
        :href="parentPath"
        @click.prevent="emit('changeDir', parentPath, $event)"
        @dragenter="() => (drag.parent = true)"
        @dragexit="onParentDragExit"
      >
        <i class="bx bx-arrow-back"></i>
      </a>
      <table @dragend="onDragEnd()">
        <tr v-if="files.length == 0 && routes.length == 1">
          <td class="empty">
            <i class="bx bx-search-alt"></i>
            <strong>Nothing to display</strong>
          </td>
        </tr>
        <file-row
          v-for="file in files"
          :file="file"
          :key="file.name"
          :draggable="isDraggable(file)"
          :highlight="belongsToDrag(file)"
          :no-hover="onDragMode"
          :pathname="pathname"
          @dragstart="onDragStart(file)"
          @dragenter="onDragEnter(file)"
          @dragexit="onDragExit(file, $event)"
          @open="(file: File, payload: MouseEvent) => emit('open', file, payload)"
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

  a.parent-dir {
    display: flex;
    height: $fib-8 * 1px;
    border-top: 1px solid var(--color-border);
    align-items: center;
    text-decoration: none !important;

    &:hover {
      cursor: pointer;
    }

    &.drag-target {
      @extend .shadow-box;
      background: var(--color-button);
      z-index: 1;
    }

    i {
      font-size: large;
      color: var(--color-accent);
      padding-left: $fib-6 * 1px;
      font-weight: 600;
    }
  }
}
</style>
