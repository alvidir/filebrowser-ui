<script setup lang="ts">
import { ref, reactive, defineEmits } from "vue";
import { Field } from "vue-fields/src/types";
import { useWarningStore } from "@/stores/warning";
import { getFilesFilter } from "@/filter";
import { File, FileMatch } from "@/file";
import * as rpc from "@/services/filebrowser.rpc";
import { Warning } from "@/warning";

interface Events {
  (e: "open", file: File, payload: MouseEvent): void;
}

const emit = defineEmits<Events>();

const warningStore = useWarningStore();
const searchfield = ref<Field | undefined>(undefined);

const matches = reactive(new Array<FileMatch>());

const search = (search: string) => {
  if (!search) {
    matches.splice(0);
    return;
  }

  rpc
    .searchFile(search)
    .then((items) => {
      const matchByFileId = new Map<string, FileMatch>();
      items.forEach((match: FileMatch) => {
        matchByFileId.set(match.file.id, match);
      });

      const filteredMatches = getFilesFilter()(
        items.map((match) => match.file)
      ).map(
        (file: File) =>
          matchByFileId.get(file.id) ??
          ({ file: file, start: 0, end: 0 } as FileMatch)
      );

      matches.splice(0, filteredMatches.length, ...filteredMatches);
    })
    .catch((error: Warning) => {
      warningStore.push(error);
    });
};

const onSearchInput = () => {
  search(searchfield.value?.text().trim() ?? "");
};

const open = (file: File, event: MouseEvent) => {
  emit("open", file, event);
};
</script>

<template>
  <search-field
    v-slot="props"
    id="search-field"
    placeholder="Search"
    ref="searchfield"
    :items="matches"
    :debounce="300"
    :large="true"
    @input="onSearchInput"
  >
    <search-item v-bind="props.item" @open="open"></search-item>
  </search-field>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

#search-field {
  width: $fib-14 * 1px;
  z-index: 1;
}
</style>
