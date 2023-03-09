import Tag, { Tags } from "@/domain/tag";
import App from "@/domain/app";
import urlJoin from "url-join";

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
    this.name = name;
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

  /**
   * Returns the numeric value of the size metadata if defined.
   *
   * @returns The size of the file.
   */
  size = (): number | undefined => {
    const size = this.metadata.get(metadataSizeKey);
    if (size !== undefined) {
      return parseInt(size);
    } else if (this.isDirectory()) {
      return 0;
    }
  };

  /**
   * Returns an array with all the tags defined in the tags metadata.
   *
   * @returns An array of tags.
   */
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

  /**
   * Returns the app instance of the file, if defined in its metadata.
   *
   * @returns The app the file belongs to.
   */
  app = (): App | undefined => {
    const toolId = this.metadata.get(metadataAppKey);
    if (toolId) return App.find(toolId);
  };

  /**
   * Updates the app metadata field of the file.
   *
   * @param app - The app to be set.
   */
  setTool = (app: App): void => {
    this.metadata.set(metadataAppKey, app.name);
  };

  /**
   * Concatenates the directory and name fields of the file into a single absolute path.
   *
   * @returns The full path of the file.
   */
  path = (): string => {
    return urlJoin(this.directory, this.name);
  };

  /**
   * Returns the external URL of the file as long as it is defined in its metadata.
   *
   * @returns The URL to the file's content.
   */
  url = (): string | undefined => {
    const ref = this.metadata.get(metadataRefKey);
    const base = this.app()?.uri;

    if (!base) return;
    if (!ref) return urlJoin(base, "ref", this.id);

    return urlJoin(base, ref);
  };

  /**
   * Returns the latest file's update date if defined in its metadata.
   *
   * @returns The latest date the file has been updated.
   */
  updatedAt = (): Date | undefined => {
    const unix = this.metadata.get(metadataUpdatedAtKey);
    if (unix) return new Date(parseInt(unix, 16) * 1000);
    else if (this.isDirectory()) return new Date();
  };

  /**
   * Returns true if, and only if, the file represents a directory. Otherwise false is provided.
   *
   * @returns True if the file represents a directory.
   */
  isDirectory = (): boolean => {
    return (this.flags & Flag.Directory) != 0 || this.isParentDirectory();
  };

  /**
   * Returns true if, and only if, the file represents a parent directory,
   *
   * @returns True if the file represents a parent directory.
   */
  isParentDirectory = (): boolean => {
    return this.name == parentDirName;
  };

  /**
   * If the given name contains errors, the very first error is returned as string. Otherwise
   * undefined is provided, meaning there are no errors.
   * @param name - The filename to check.
   * @returns The error in the filename, if any.
   */
  checkName = (name: string): string | undefined => {
    return FileData.checkName(name);
  };
}

export default FileData;
export { Flag, parentDirName, maxFilenameLen, metadataSizeKey };
