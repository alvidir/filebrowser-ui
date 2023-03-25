<script setup lang="ts">
import { ref } from "vue";
import { useSearchStore } from "@/stores/search";

import SearchItem from "@/components/SearchMatch.vue";
import { Field } from "vue-fields/src/types";

const searchStore = useSearchStore();
const searchfield = ref<Field | undefined>(undefined);

const onSearchInput = () => {
  const search = searchfield.value?.text().trim();
  searchStore.search(search ?? "");
};
</script>

<template>
  <search-field
    v-slot="props"
    id="search-field"
    placeholder="Search"
    ref="searchfield"
    :items="searchStore.items"
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
