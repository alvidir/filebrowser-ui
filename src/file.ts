import * as path from "@/path";
import { Tool, findTool } from "./tool";
import { Tag } from "./tag";
import urlJoin from "url-join";

const metadataUpdatedAtKey = "updated_at";
const metadataSizeKey = "size";
const metadataToolKey = "app";
const metadataRefKey = "ref";
const metadataTagsKey = "tags";

const tagSeparator = ";";
const filenameRegex = /^[^/]+$/;
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
    return "A name cannot be empty";
  }

  if (!name.match(filenameRegex)) {
    return "A name cannot contains slashes.";
  }

  if (name.length > maxFilenameLen) {
    return `A name cannot exceed ${maxFilenameLen} characters long.`;
  }
};

const isDirectory = (file: File): boolean => {
  return (file.flags & Flag.Directory) != 0;
};

const getPath = (file: File): string => {
  return path.sanatize(urlJoin(file.directory, file.name));
};

const getUrl = (file: File): string | undefined => {
  if (isDirectory(file)) return getPath(file);

  const ref = file.metadata.get(metadataRefKey);
  const base = getTool(file)?.uri;
  if (base && ref) return urlJoin(base, ref);
  if (base) return urlJoin(base, metadataRefKey, file.id);
};

const getTool = (file: File): Tool | undefined => {
  const toolId = file.metadata.get(metadataToolKey);
  if (toolId) return findTool(toolId);
};

const setTool = (file: File, tool: Tool) => {
  if (isDirectory(file)) return;
  file.metadata.set(metadataToolKey, tool.name);
};

const getSize = (file: File): number | undefined => {
  if (!isDirectory(file)) return;

  const size = file.metadata.get(metadataSizeKey);
  if (size !== undefined) return parseInt(size);
  return 0;
};

const setSize = (file: File, size: number) => {
  if (!isDirectory(file)) return;
  file.metadata.set(metadataSizeKey, size.toString());
};

const getTags = (file: File): Array<string> => {
  const tags = file.metadata.get(metadataTagsKey)?.split(tagSeparator) ?? [];
  if (isDirectory(file) && getSize(file) == 0) {
    tags.unshift(Tag.Virtual);
  }

  const tool = getTool(file);
  if (tool) {
    tags.unshift(tool.name);
  }

  return tags;
};

const getUpdatedAt = (file: File): Date => {
  const unix = file.metadata.get(metadataUpdatedAtKey);
  if (unix) return new Date(parseInt(unix, 16) * 1000);
  return new Date();
};

export {
  File,
  FileMatch,
  Permissions,
  Flag,
  intoDirectory,
  checkFilename,
  isDirectory,
  getUpdatedAt,
  getPath,
  getSize,
  setSize,
  getUrl,
  getTool,
  setTool,
  getTags,
};
