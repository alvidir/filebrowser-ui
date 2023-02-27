import * as utils from "@/utils";
import * as constants from "@/constants";
import Tag, { Tags } from "@/domain/tag";
import Tool from "@/domain/tool";
import join from "url-join";

const METADATA_UPDATED_AT_KEY = "updated_at";
const METADATA_SIZE_KEY = "size";
const METADATA_TOOL_KEY = "app_id";
const METADATA_REF_KEY = "ref";
const METADATA_TAGS_KEY = "tags";

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
      this.metadata.get(METADATA_TAGS_KEY)?.split(constants.tagSeparator) ?? [];

    if (this.isDirectory() && !this.isParentDirectory() && !this.size()) {
      tags.unshift(Tags.Virtual);
    }

    const tool = this.tool();
    if (tool) {
      tags.unshift(tool.name);
    }

    return tags.map((tag) => Tag.find(tag));
  };

  filename = (): string => {
    return utils.underscoresToSpaces(this.name);
  };

  path = (): string => {
    return join(this.directory, this.name);
  };

  size = (): number | undefined => {
    const size = this.metadata.get(METADATA_SIZE_KEY);
    if (size !== undefined) {
      return parseInt(size);
    }
  };

  tool = (): Tool | undefined => {
    const toolId = this.metadata.get(METADATA_TOOL_KEY);
    if (toolId) return Tool.find(toolId);
  };

  url = (): string | undefined => {
    const ref = this.metadata.get(METADATA_REF_KEY);
    const base = this.tool()?.uri;

    if (ref && base) {
      return join(base, ref);
    }

    return "#";
  };

  updatedAt = (): Date | undefined => {
    const unix = this.metadata.get(METADATA_UPDATED_AT_KEY);
    if (unix) return new Date(parseInt(unix, 16) * 1000);
  };

  isDirectory = (): boolean => {
    return (this.flags & Flags.Directory) != 0 || this.isParentDirectory();
  };

  isParentDirectory = (): boolean => {
    return this.name == constants.parentDirectory;
  };
}

export default FileData;
