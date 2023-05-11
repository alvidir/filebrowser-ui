import { defineStore } from "pinia";
import { reactive } from "vue";
import * as path from "@/path";
import { File, checkFilename, getTags } from "@/file";
import { Tag } from "@/tag";

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
    if (getDirectory(dir)?.find((fileId) => getFile(fileId)?.name === filename))
      return "This name already exists";

    return checkFilename(filename);
  };

  const addFile = (file: File) => {
    const filedir = path.sanatize(file.directory);
    if (!filesIdByDirectory.has(filedir)) filesIdByDirectory.set(filedir, []);

    const wasVirtual = filesIdByDirectory.get(filedir)?.push(file.id) === 1;
    filesById.set(file.id, file);

    const folder = getFile(file.directory);
    if (!wasVirtual || !folder) return;

    debugger;
    console.log("BEFORE : ", folder.id, getTags(folder));
    const index = getTags(folder).indexOf(Tag.Virtual as string);
    if (index != -1) {
      console.log(getTags(folder).splice(index, 1));
    }
    console.log("AFTER : ", folder.id, getTags(folder));
  };

  const removeFile = (id: string) => {
    const subject = filesById.get(id);
    if (!subject) return;

    filesById.delete(id);

    const filedir = path.sanatize(subject.directory);
    const dir = getDirectory(filedir);
    if (!dir) return;

    dir.splice(dir.indexOf(id), 1);
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
    check,
  };
});
