import { FileData } from "@/domain/directory";

class FilterController {
  filter = (files: Array<FileData>): Array<FileData> => {
    return files;
  };
}

export default FilterController;
