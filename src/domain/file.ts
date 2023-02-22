import * as utils from "@/utils";
import * as constants from "@/constants";
import Tag, { Tags } from "@/domain/tag";
import Tool from "@/domain/tool";
import config from "@/config.json";

enum Flags {
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
  directory: string;
  metadata: Map<string, string> = new Map();
  permissions: Map<number, Permissions> = new Map();
  flags = 0;

  constructor(id: string, name: string, path: string) {
    this.id = id;
    this.name = name;
    this.directory = path;
  }

  tags = (): Array<Tag> => {
    const tags =
      this.metadata.get(config.METADATA_TAGS)?.split(constants.tagSeparator) ??
      [];

    if (this.isDirectory() && !this.size()) {
      tags.unshift(Tags.Virtual);
    }

    const tool = this.tool();
    if (tool) {
      tags.unshift(tool.id);
    }

    return tags.map((tag) => Tag.find(tag));
  };

  filename = (): string => {
    return utils.underscoresToSpaces(this.name);
  };

  size = (): number | undefined => {
    const size = this.metadata.get(config.METADATA_SIZE);
    if (size !== undefined) {
      return parseInt(size);
    }
  };

  tool = (): Tool | undefined => {
    const toolId = this.metadata.get(config.METADATA_TOOL);
    if (toolId) return Tool.find(toolId);
  };

  url = (): string | undefined => {
    const ref = this.metadata.get(config.METADATA_REF);
    const base = this.tool()?.baseUri;

    if (ref && base) {
      return `${base}/${ref}`;
    }

    return "#";
  };

  updatedAt = (): Date => {
    const unix = this.metadata.get(config.METADATA_UPDATED_AT) ?? "0";
    return new Date(parseInt(unix, 16) * 1000);
  };

  isDirectory = (): boolean => {
    return (this.flags & Flags.Directory) != 0 || this.isParentDirectory();
  };

  isParentDirectory = (): boolean => {
    return this.name == constants.parentDirectory;
  };
}

export default FileData;
