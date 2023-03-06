import FileData from "@/domain/file";

class SearchItem {
  file: FileData;
  matchStart: number;
  matchEnd: number;

  constructor(file: FileData, start: number, end: number) {
    this.file = file;
    this.matchStart = start;
    this.matchEnd = end;
  }
}

export default SearchItem;
