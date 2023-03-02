import Tag, { Tags } from "@/domain/tag";
import Tool from "@/domain/tool";
import urlJoin from "url-join";
import Directory from "@/domain/directory";

const METADATA_UPDATED_AT_KEY = "updated_at";
const METADATA_SIZE_KEY = "size";
const METADATA_TOOL_KEY = "app_id";
const METADATA_REF_KEY = "ref";
const METADATA_TAGS_KEY = "tags";

const parentDirName = "..";
const tagSeparator = ";";
const filenameRegex = /^[a-zA-Z0-9 ]*$/;
const maxFilenameLen = 36;

enum Flag {
  Directory = 0x04,
}

class Permissions {
  read = false;
  write = false;
  owner = false;
}

class FileData {
  id: string;
  name: string;
  directory: Directory;
  metadata = new Map<string, string>();
  permissions = new Map<number, Permissions>();
  flags = 0;

  constructor(id: string, name: string, dir: Directory) {
    this.id = id;
    this.name = name;
    this.directory = dir;
  }

  static checkName(name: string, directory: Directory): string | undefined {
    if (!name) {
      return "Filename cannot be empty";
    }

    if (!name.match(filenameRegex)) {
      return "A name cannot contains special characters.";
    }

    if (name.length > maxFilenameLen) {
      return `A name cannot exceed ${maxFilenameLen} characters long.`;
    }

    if (directory.exists(name)) {
      return "This filename already exists";
    }
  }

  /**
   * Returns the numeric value of the size metadata if defined.
   *
   * @returns The size of the file.
   */
  size = (): number | undefined => {
    const size = this.metadata.get(METADATA_SIZE_KEY);
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
    const tags =
      this.metadata.get(METADATA_TAGS_KEY)?.split(tagSeparator) ?? [];

    if (this.isDirectory() && !this.isParentDirectory() && !this.size()) {
      tags.unshift(Tags.Virtual);
    }

    const tool = this.tool();
    if (tool) {
      tags.unshift(tool.name);
    }

    return tags.map((tag) => Tag.find(tag));
  };

  /**
   * Returns the tool instance of the file, if defined in its metadata.
   *
   * @returns The tool the file belongs to.
   */
  tool = (): Tool | undefined => {
    const toolId = this.metadata.get(METADATA_TOOL_KEY);
    if (toolId) return Tool.find(toolId);
  };

  /**
   * Updates the tool metadata field of the file.
   *
   * @param tool - The tool to be set.
   */
  setTool = (tool: Tool): void => {
    this.metadata.set(METADATA_TOOL_KEY, tool.name);
  };

  /**
   * Concatenates the directory and name fields of the file into a single absolute path.
   *
   * @returns The full path of the file.
   */
  path = (): string => {
    return urlJoin(this.directory.path, this.name);
  };

  /**
   * Returns the external URL of the file as long as it is defined in its metadata.
   *
   * @returns The URL to the file's content.
   */
  url = (): string | undefined => {
    const ref = this.metadata.get(METADATA_REF_KEY);
    const base = this.tool()?.uri;

    if (ref && base) {
      return urlJoin(base, ref);
    }

    return;
  };

  /**
   * Returns the latest file's update date if defined in its metadata.
   *
   * @returns The latest date the file has been updated.
   */
  updatedAt = (): Date | undefined => {
    const unix = this.metadata.get(METADATA_UPDATED_AT_KEY);
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
    return FileData.checkName(name, this.directory);
  };
}

export default FileData;
export { parentDirName, Flag };
