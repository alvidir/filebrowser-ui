import { File, isDirectory } from "@/file";

type Filter<T> = (files: Array<T>) => Array<T>;

enum Sort {
  Az = "az",
  Za = "za",
}

type sortFn = (a: File, b: File) => number;
const sortStrategies: { [key: string]: sortFn } = {
  [Sort.Az]: (a: File, b: File) => a.name.localeCompare(b.name),
  [Sort.Za]: (a: File, b: File) => b.name.localeCompare(a.name),
};

const hiddenFilePrefix = ".";
const isHiddenFile = (file: File): boolean => {
  return file.name.at(0) === hiddenFilePrefix;
};

let filters = {
  sortStrategy: sortStrategies[Sort.Az],
  showHiddenFiles: false,
};

const sortDecorator = (a: File, b: File): number => {
  if (isDirectory(a) && !isDirectory(b)) return -1;
  if (isDirectory(b) && !isDirectory(a)) return 1;

  return filters.sortStrategy(a, b);
};

const getFilesFilter = (): Filter<File> => {
  return (files: Array<File>): Array<File> => {
    if (!filters.showHiddenFiles) {
      files = files.filter((file) => !isHiddenFile(file));
    }

    return files.sort(sortDecorator);
  };
};

export { Sort, Filter, filters, getFilesFilter };
