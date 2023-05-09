import { defineStore } from "pinia";
import { reactive } from "vue";
import * as path from "@/path";
import { File, checkFilename } from "@/file";

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
    if (!filesIdByDirectory.has(filedir))
      filesIdByDirectory.set(filedir, new Array());

    filesIdByDirectory.get(filedir)?.push(file.id);
    filesById.set(file.id, file);
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

// import { defineStore } from "pinia";
// import { ref, reactive, computed, inject } from "vue";
// import FileData, { metadataSizeKey } from "@/domain/file";
// import { useWarningStore } from "@/stores/warning";
// import Warning from "@/domain/warning";
// import urlJoin from "url-join";
// import Path, { pathSeparator } from "@/path";

// interface FilebrowserClient {
//   getDirectory: (path: string) => Promise<Array<FileData>>;
//   renameFile: (file: FileData, filename: string) => Promise<void>;
//   moveFile: (source: FileData, dest: string) => Promise<void>;
//   deleteFile: (file: FileData) => Promise<void>;
//   createFile: (file: FileData) => Promise<FileData>;
// }

// export const useDirectoryStore = defineStore("directory", () => {
//   const filebrowserClient = inject<FilebrowserClient>("filebrowserClient");
//   const warningStore = useWarningStore();

//   const dirs = reactive(new Map<string, Array<FileData>>());
//   const currentPath = ref(window.location.pathname);

//   const path = computed((): string => {
//     return Path.underscoresToSpaces(Path.sanatize(currentPath.value));
//   });

//   const files = computed((): Array<FileData> => {
//     const path = Path.sanatize(currentPath.value);
//     const directory = dirs.get(path);

//     if (!directory && filebrowserClient) {
//       filebrowserClient
//         .getDirectory(path)
//         .then((dir) => {
//           dirs.set(path, dir);
//         })
//         .catch((error: Warning) => {
//           warningStore.push(error);
//         });
//     }

//     return directory ?? [];
//   });

//   const parentdir = computed((): string | undefined => {
//     const path = Path.sanatize(currentPath.value);
//     if (path === pathSeparator) return;

//     const index = path.lastIndexOf(pathSeparator);
//     return Path.sanatize(path.substring(0, index));
//   });

//   const setPath = (target: string) => {
//     files.value?.forEach((file) => (file.new = false));

//     window.history.pushState("", "", Path.sanatize(target));
//     currentPath.value = target;
//   };

//   const changeDirectory = (delta: number) => {
//     const target = urlJoin(
//       currentPath.value.split(pathSeparator).slice(0, delta)
//     );

//     setPath(target);
//   };

//   const openfile = (file: FileData) => {
//     if (file.isParentDirectory()) {
//       changeDirectory(-1);
//     } else if (file.isDirectory()) {
//       setPath(file.path());
//     } else {
//       window.open(file.url() ?? "#", "_blank")?.focus();
//     }
//   };

//   const renameFile = (file: FileData, filename: string) => {
//     if (!filebrowserClient || file.checkName(filename)) return;

//     filebrowserClient
//       .renameFile(file, filename)
//       .then(() => {
//         file.name = filename;
//       })
//       .catch((error: Warning) => {
//         warningStore.push(error);
//       });
//   };

//   const moveFile = (source: FileData, target: FileData) => {
//     if (!filebrowserClient) return;

//     const targetDir = source.isDirectory() ? source.name : "";
//     const targetPath = target.isParentDirectory()
//       ? target.directory
//       : urlJoin(target.directory, target.name);

//     const dest = Path.asDirectory(
//       Path.sanatize(urlJoin(targetPath, targetDir))
//     );

//     filebrowserClient
//       .moveFile(source, dest)
//       .then(() => {
//         const path = Path.sanatize(source.directory);
//         const index = dirs.get(path)?.indexOf(source);
//         if (index !== undefined) dirs.get(path)?.splice(index, 1);

//         let movedSize = 1;
//         if (source.isDirectory()) {
//           movedSize = +(source.metadata.get(metadataSizeKey) ?? "0");
//         }

//         if (parentdir.value) {
//           // update old parent's size metadata
//           const folder = dirs.get(parentdir.value)?.find((f) => {
//             return f.path() === currentPath.value;
//           });

//           const size =
//             +(folder?.metadata.get(metadataSizeKey) ?? "0") - movedSize;

//           folder?.metadata.set(metadataSizeKey, size.toString());
//         }

//         // update new parent's size metadata
//         const folder = dirs.get(path)?.find((f) => {
//           console.log(targetPath);
//           console.log(f.path());
//           return f.path() === targetPath;
//         });

//         const size =
//           +(folder?.metadata.get(metadataSizeKey) ?? "0") + movedSize;

//         folder?.metadata.set(metadataSizeKey, size.toString());

//         const directory = dirs.get(Path.sanatize(targetPath));
//         if (directory) {
//           source.directory = Path.sanatize(targetPath);
//           directory.push(source);
//         }
//       })
//       .catch((error: Warning) => {
//         warningStore.push(error);
//       });
//   };

//   const deleteFile = (file: FileData) => {
//     if (!filebrowserClient) return;

//     filebrowserClient
//       .deleteFile(file)
//       .then(() => {
//         const path = Path.sanatize(file.directory);
//         const index = dirs.get(path)?.indexOf(file);

//         const removed = new Array<FileData>();
//         if (index !== undefined) {
//           removed.concat(dirs.get(path)?.splice(index, 1) ?? []);
//         }

//         let totalSizeRemoved = 0;
//         (removed ?? []).forEach((item) => {
//           if (item.isDirectory()) {
//             totalSizeRemoved += +(item?.metadata.get(metadataSizeKey) ?? "0");
//           } else {
//             totalSizeRemoved++;
//           }
//         });

//         // update parent's size metadata
//         if (!parentdir.value) return;
//         const folder = dirs.get(Path.sanatize(parentdir.value))?.find((f) => {
//           return f.path() === file.directory;
//         });

//         const size =
//           +(folder?.metadata.get(metadataSizeKey) ?? "0") - totalSizeRemoved;
//         folder?.metadata.set(metadataSizeKey, size.toString());
//       })
//       .catch((error: Warning) => {
//         warningStore.push(error);
//       });
//   };

//   const addFile = (file: FileData) => {
//     if (!filebrowserClient) return;
//     file.new = true;

//     const path = Path.sanatize(file.directory);
//     const files = dirs.get(path);
//     if (!files) return;

//     files.push(file);

//     // update parent's size metadata
//     if (!parentdir.value) return;
//     const folder = dirs.get(Path.sanatize(parentdir.value))?.find((f) => {
//       return f.path() === file.directory;
//     });

//     const size = +(folder?.metadata.get(metadataSizeKey) ?? "0") + 1;
//     folder?.metadata.set(metadataSizeKey, size.toString());
//   };

//   const createFile = (file: FileData): Promise<void> | undefined => {
//     if (!filebrowserClient) return;

//     return filebrowserClient
//       .createFile(file)
//       .then((file) => {
//         addFile(file);
//       })
//       .catch((error: Warning) => {
//         warningStore.push(error);
//       });
//   };

//   const exists = (name: string): boolean => {
//     if (files.value.some((file) => file.name == name)) {
//       return true;
//     }

//     return false;
//   };

//   return {
//     path,
//     files,
//     parentdir,
//     openfile,
//     changeDirectory,
//     renameFile,
//     moveFile,
//     deleteFile,
//     createFile,
//     exists,
//   };
// });
