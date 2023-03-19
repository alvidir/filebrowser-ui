<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted } from "vue";
import SearchItem from "@/components/SearchMatch.vue";
import { Field } from "vue-fields/src/types";
import { Subject } from "@/controllers/observer";
import SearchMatch from "@/domain/search";

interface SearchCtrl extends Subject {
  search: (s: string) => void;
  getItems: () => Array<SearchMatch>;
}

const searchCtrl = inject<SearchCtrl>("searchCtrl");
const items = ref(new Array<SearchMatch>());

const onSearchInput = (ctrl: Field) => {
  const search = ctrl.text();
  searchCtrl?.search(search);
};

const update = () => {
  const matches = searchCtrl?.getItems() ?? [];
  items.value = matches.sort((a, b) => a.start - b.start);
};

onMounted(() => {
  searchCtrl?.addObserver({ update });
});

onUnmounted(() => {
  searchCtrl?.removeObserver({ update });
});
</script>

<template>
  <search-field
    v-slot="props"
    id="search-field"
    placeholder="Search"
    :items="items"
    :debounce="300"
    :large="true"
    @input="onSearchInput"
  >
    <search-item :match="props.item"></search-item>
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
