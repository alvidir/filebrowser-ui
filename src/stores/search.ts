import { defineStore } from "pinia";
import { reactive, computed, inject } from "vue";
import { useWarningStore } from "@/stores/warning";
import Warning from "@/domain/warning";
import SearchMatch from "@/domain/search";

interface FilebrowserClient {
  searchFile(search: string): Promise<Array<SearchMatch>>;
}

export const useSearchStore = defineStore("search", () => {
  const filebrowserClient = inject<FilebrowserClient>("filebrowserClient");
  const warningStore = useWarningStore();

  const _items = reactive(new Array<SearchMatch>());

  const items = computed(() => {
    return _items.sort((a, b) => a.start - b.start);
  });

  const search = (search: string) => {
    if (!search || !filebrowserClient) {
      _items.splice(0);
      return;
    }

    filebrowserClient
      .searchFile(search)
      .then((matches) => {
        _items.splice(0, _items.length, ...matches);
      })
      .catch((error: Warning) => {
        warningStore.push(error);
      });
  };

  return { search, items };
});
