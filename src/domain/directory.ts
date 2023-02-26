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

  removeFile = (file: FileData) => {
    const index = this.files.findIndex(
      file.id
        ? (item) => item.id === file.id
        : (item) => item.name === file.name
    );

    if (index > -1) {
      this.files.splice(index, 1);
    }
  };

  addFile = (file: FileData) => {
    this.files.push(file);
  };
}

export default Directory;
