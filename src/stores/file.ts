import { defineStore } from "pinia";
import { reactive } from "vue";
import * as path from "@/path";
import { File, checkFilename, getSize, setSize } from "@/file";

export const useFileStore = defineStore("file", () => {
  const filesById = reactive(new Map<string, File>());
  const filesIdByDirectory = reactive(new Map<string, Array<string>>());

  const getFile = (id: string): File | undefined => {
    return filesById.get(id);
  };

  const getDirectory = (dir: string): Array<string> => {
    return filesIdByDirectory.get(path.sanatize(dir)) ?? [];
  };

  const check = (dir: string, filename: string): string | undefined => {
    const directory = getDirectory(dir);
    if (!directory) return;

    if (directory.some((fileId) => getFile(fileId)?.name.trim() === filename))
      return "This name already exists";

    return checkFilename(filename);
  };

  const addFile = (file: File) => {
    const filedir = path.sanatize(file.directory);
    if (!filesIdByDirectory.has(filedir)) filesIdByDirectory.set(filedir, []);

    filesIdByDirectory.get(filedir)?.push(file.id);
    filesById.set(file.id, file);
  };

  const removeFile = (id: string): File | undefined => {
    const file = filesById.get(id);
    if (!file) return;

    filesById.delete(id);

    const filedir = path.sanatize(file.directory);
    const dir = getDirectory(filedir);
    if (dir) dir.splice(dir.indexOf(id), 1);

    const folder = getFile(file.directory);
    if (folder) {
      const size = getSize(folder) ?? 0;
      setSize(folder, size - 1);
    }

    return file;
  };

  const moveFile = (id: string, dest: string) => {
    dest = path.sanatize(dest);

    const file = removeFile(id);
    if (!file) return;

    const folder = getFile(dest);
    if (folder) {
      const size = getSize(folder) ?? 0;
      setSize(folder, size + 1);
    }

    if (filesIdByDirectory.has(dest)) {
      file.directory = dest;
      addFile(file);
    }
  };

  const renameFile = (id: string, name: string) => {
    const file = getFile(id);
    if (file) file.name = name;
  };

  return {
    getFile,
    getDirectory,
    addFile,
    removeFile,
    renameFile,
    moveFile,
    check,
  };
});
