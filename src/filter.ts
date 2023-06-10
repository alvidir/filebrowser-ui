import { File, isDirectory } from "@/file";

type Filter<T> = (files: Array<T | undefined>) => Array<T>;

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

const filters = {
  sortStrategy: sortStrategies[Sort.Az],
  showHiddenFiles: false,
};

const sortDecorator = (a: File, b: File): number => {
  if (isDirectory(a) && !isDirectory(b)) return -1;
  if (isDirectory(b) && !isDirectory(a)) return 1;

  return filters.sortStrategy(a, b);
};

const getFilesFilter = (): Filter<File> => {
  const isFile = (file: File | undefined): file is File => {
    return !!file;
  };
  const isVisible = (file: File): boolean => {
    return filters.showHiddenFiles || !isHiddenFile(file);
  };

  return (files: Array<File | undefined>): Array<File> => {
    return files.filter(isFile).filter(isVisible).sort(sortDecorator);
  };
};

export { Sort, Filter, filters, getFilesFilter };
