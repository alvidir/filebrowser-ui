import FileData from "@/domain/file";

class SearchMatch {
  file: FileData;
  start: number;
  end: number;

  constructor(file: FileData, start: number, end: number) {
    this.file = file;
    this.start = start;
    this.end = end;
  }
}

export default SearchMatch;
