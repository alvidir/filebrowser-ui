import Tag, { Tags } from "@/domain/tag";
import App from "@/domain/app";
import urlJoin from "url-join";

const defaultFilename = "Untitled project";

const metadataUpdatedAtKey = "updated_at";
const metadataSizeKey = "size";
const metadataAppKey = "app";
const metadataRefKey = "ref";
const metadataTagsKey = "tags";

const parentDirName = "..";
const tagSeparator = ";";
const filenameRegex = /^[a-zA-Z0-9 ]*$/;
const maxFilenameLen = 34;

enum Flag {
  Directory = 0x01,
}

class Permissions {
  read = false;
  write = false;
  owner = false;
}

class FileData {
  id: string;
  name: string;
  directory: string;
  metadata = new Map<string, string>();
  permissions = new Map<number, Permissions>();
  new = false;
  flags = 0;

  constructor(id: string, name: string, dir: string) {
    this.id = id;
    this.name = name.length ? name : defaultFilename;
    this.directory = dir;
  }

  static checkName(name: string): string | undefined {
    if (!name) {
      return "Filename cannot be empty";
    }

    if (!name.match(filenameRegex)) {
      return "A name cannot contains special characters.";
    }

    if (name.length > maxFilenameLen) {
      return `A name cannot exceed ${maxFilenameLen} characters long.`;
    }
  }

  size = (): number | undefined => {
    const size = this.metadata.get(metadataSizeKey);
    if (size !== undefined) {
      return parseInt(size);
    } else if (this.isDirectory()) {
      return 0;
    }
  };

  tags = (): Array<Tag> => {
    const tags = this.metadata.get(metadataTagsKey)?.split(tagSeparator) ?? [];

    if (this.isDirectory() && !this.isParentDirectory() && !this.size()) {
      tags.unshift(Tags.Virtual);
    }

    const app = this.app();
    if (app) {
      tags.unshift(app.name);
    }

    return tags.map((tag) => Tag.find(tag));
  };

  app = (): App | undefined => {
    const toolId = this.metadata.get(metadataAppKey);
    if (toolId) return App.find(toolId);
  };

  setApp = (app: App): void => {
    this.metadata.set(metadataAppKey, app.name);
  };

  path = (): string => {
    return urlJoin(this.directory, this.name);
  };

  url = (): string | undefined => {
    const ref = this.metadata.get(metadataRefKey);
    const base = this.app()?.uri;

    if (!base) return;
    if (!ref) return urlJoin(base, "ref", this.id);

    return urlJoin(base, ref);
  };

  updatedAt = (): Date | undefined => {
    const unix = this.metadata.get(metadataUpdatedAtKey);
    if (unix) return new Date(parseInt(unix, 16) * 1000);
    else if (this.isDirectory()) return new Date();
  };

  isDirectory = (): boolean => {
    return (this.flags & Flag.Directory) != 0 || this.isParentDirectory();
  };

  isParentDirectory = (): boolean => {
    return this.name == parentDirName;
  };

  checkName = (name: string): string | undefined => {
    return FileData.checkName(name);
  };
}

export default FileData;
export {
  Flag,
  parentDirName,
  maxFilenameLen,
  metadataSizeKey,
  defaultFilename,
};
