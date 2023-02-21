import FileData from "@/domain/file";

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

class FilterController {
  private sortStrategy = sortStrategies[Sort.Az];
  private showHiddenFiles = false;

  private isHiddenFile(file: FileData): boolean {
    return file.name.at(0) === hiddenFilePrefix;
  }

  private sortDecorator = (a: FileData, b: FileData): number => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (b.isDirectory() && !a.isDirectory()) return 1;

    if (this.sortStrategy) {
      return this.sortStrategy(a, b);
    }

    return 1;
  };

  filter = (files: Array<FileData>): Array<FileData> => {
    if (!this.showHiddenFiles) {
      files = files.filter((file) => !this.isHiddenFile(file));
    }

    return files.sort(this.sortDecorator);
  };
}

export default FilterController;
export { Sort };
