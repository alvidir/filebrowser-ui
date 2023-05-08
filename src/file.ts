import * as path from "@/path";
import * as tool from "./tool";
import urlJoin from "url-join";

// const defaultFilename = "Untitled project";

// const metadataUpdatedAtKey = "updated_at";
const metadataSizeKey = "size";
const metadataToolKey = "app";
const metadataRefKey = "ref";
// const metadataTagsKey = "tags";

// const parentDirName = "..";
// const tagSeparator = ";";
const filenameRegex = /^[a-zA-Z0-9 ]*$/;
const maxFilenameLen = 34;

enum Flag {
  Directory = 0x01,
}

interface Permissions {
  read: boolean;
  write: boolean;
  owner: boolean;
}

interface File {
  id: string;
  name: string;
  directory: string;
  metadata: Map<string, string>;
  permissions: Map<number, Permissions>;
  flags: number;
  isNew?: boolean;
}

interface FileMatch {
  file: File;
  start: number;
  end: number;
}

const intoDirectory = (file: File): File => {
  file.flags |= Flag.Directory;
  return file;
};

const checkFilename = (name: string): string | undefined => {
  if (!name) {
    return "Filename cannot be empty";
  }

  if (!name.match(filenameRegex)) {
    return "A name cannot contains special characters.";
  }

  if (name.length > maxFilenameLen) {
    return `A name cannot exceed ${maxFilenameLen} characters long.`;
  }
};

const isDirectory = (file: File): boolean => {
  return (file.flags & Flag.Directory) != 0;
};

const getPath = (file: File): string => {
  return path.sanatize(path.join(file.directory, file.name));
};

const getUrl = (file: File): string | undefined => {
  if (isDirectory(file)) return getPath(file);

  const ref = file.metadata.get(metadataRefKey);
  const base = getTool(file)?.uri;
  if (base && ref) return urlJoin(base, ref);
  if (base) return urlJoin(base, "ref", file.id);
};

const getTool = (file: File): tool.Tool | undefined => {
  const toolId = file.metadata.get(metadataToolKey);
  if (toolId) return tool.getTool(toolId);
};

const getSize = (file: File): number | undefined => {
  if (!isDirectory(file)) return;

  const size = file.metadata.get(metadataSizeKey);
  if (size !== undefined) return parseInt(size);
  return 0;
};

export {
  File,
  FileMatch,
  Permissions,
  Flag,
  intoDirectory,
  checkFilename,
  isDirectory,
  getPath,
  getSize,
  getUrl,
};

// tags = (): Array<Tag> => {
//   const tags = this.metadata.get(metadataTagsKey)?.split(tagSeparator) ?? [];

//   if (this.isDirectory() && !this.isParentDirectory() && !this.size()) {
//     tags.unshift(Tags.Virtual);
//   }

//   const app = this.app();
//   if (app) {
//     tags.unshift(app.name);
//   }

//   return tags.map((tag) => Tag.find(tag));
// };

// app = (): App | undefined => {
//   const toolId = this.metadata.get(metadataToolKey);
//   if (toolId) return App.find(toolId);
// };

// setApp = (app: App): void => {
//   this.metadata.set(metadataToolKey, app.name);
// };

// path = (): string => {
//   return urlJoin(this.directory, this.name);
// };

// url = (): string | undefined => {
//   const ref = this.metadata.get(metadataRefKey);
//   const base = this.app()?.uri;

//   if (!base) return;
//   if (!ref) return urlJoin(base, "ref", this.id);

//   return urlJoin(base, ref);
// };

// updatedAt = (): Date | undefined => {
//   const unix = this.metadata.get(metadataUpdatedAtKey);
//   if (unix) return new Date(parseInt(unix, 16) * 1000);
//   else if (this.isDirectory()) return new Date();
// };

// isDirectory = (): boolean => {
//   return (this.flags & Flag.Directory) != 0 || this.isParentDirectory();
// };

// isParentDirectory = (): boolean => {
//   return this.name == parentDirName;
// };

// checkName = (name: string): string | undefined => {
//   return FileData.checkName(name);
// };
