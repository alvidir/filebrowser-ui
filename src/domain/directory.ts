import FileData from "@/domain/file";

class Directory {
  id: string;
  files: Array<FileData> = [];

  constructor(id: string) {
    this.id = id;
  }

  getFileByName = (name: string): FileData | undefined => {
    return this.files.find((file) => file.name === name);
  };
}

export default Directory;
