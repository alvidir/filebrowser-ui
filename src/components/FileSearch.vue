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

<script scoped lang="ts">
import { defineComponent, inject } from "vue";
import SearchItem from "@/components/SearchMatch.vue";
import { FieldController } from "vue-fields/src/main";
import { ISubject } from "@/controllers/observer";
import SearchMatch from "@/domain/search";

interface SearchCtrl extends ISubject {
  search: (s: string) => void;
  getItems: () => Array<SearchMatch>;
}

export default defineComponent({
  name: "FileSearch",
  components: {
    SearchItem,
  },

  setup() {
    return {
      searchCtrl: inject<SearchCtrl>("searchCtrl"),
    };
  },

  data() {
    return {
      items: [] as Array<SearchMatch>,
    };
  },

  methods: {
    onSearchInput(ctrl: FieldController) {
      const search = ctrl.value();
      this.searchCtrl?.search(search);
    },

    update() {
      const items = this.searchCtrl?.getItems() ?? [];
      this.items = items.sort((a, b) => a.start - b.start);
    },
  },

  mounted() {
    this.searchCtrl?.addObserver(this);
  },

  unmounted() {
    this.searchCtrl?.removeObserver(this);
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

#search-field {
  width: $fib-14 * 1px;
  z-index: 1;
}
</style>
