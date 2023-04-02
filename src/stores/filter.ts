import { defineStore } from "pinia";
import FileData from "@/domain/file";
import { ref } from "vue";

const hiddenFilePrefix = ".";

enum Sort {
  Az = "az",
  Za = "za",
}

type sortFn = (a: FileData, b: FileData) => number;
const sortStrategies: { [key: string]: sortFn } = {
  [Sort.Az]: (a: FileData, b: FileData) => a.name.localeCompare(b.name),
  [Sort.Za]: (a: FileData, b: FileData) => b.name.localeCompare(a.name),
};

const isHiddenFile = (file: FileData): boolean => {
  return file.name.at(0) === hiddenFilePrefix;
};

export const useFilterStore = defineStore("filter", () => {
  const sortStrategy = ref(sortStrategies[Sort.Az]);
  const showHiddenFiles = ref(false);

  const sortDecorator = (a: FileData, b: FileData): number => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (b.isDirectory() && !a.isDirectory()) return 1;

    return sortStrategy.value(a, b);
  };

  const filter = (files: Array<FileData>): Array<FileData> => {
    if (!showHiddenFiles.value) {
      files = files.filter((file) => !isHiddenFile(file));
    }

    return files.sort(sortDecorator);
  };

  return { filter };
});
