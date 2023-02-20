import * as utils from "@/utils";
import * as constants from "@/constants";

enum Flags {
  Directory = 0x04,
}

enum MetadataKey {
  Url = "url",
  UpdatedAt = "updated_at",
  ToolId = "tool_id",
  Size = "size",
}

class Permissions {
  read = false;
  write = false;
  owner = false;
}

class FileData {
  id: string;
  name: string;
  metadata: Map<string, string> = new Map();
  permissions: Map<number, Permissions> = new Map();
  flags = 0;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  filename = (): string => {
    return utils.underscoresToSpaces(this.name);
  };

  size = (): string | undefined => {
    return this.metadata.get(MetadataKey.Size);
  };

  url = (): string | undefined => {
    return "";
  };

  updatedAt = (): Date => {
    const unix = this.metadata.get(MetadataKey.UpdatedAt) ?? "0";
    return new Date(parseInt(unix, 16) * 1000);
  };

  isDirectory = (): boolean => {
    return (this.flags & Flags.Directory) != 0;
  };

  isParentDirectory = (): boolean => {
    return this.name == constants.PARENT_DIRECTORY;
  };
}

class Directory {
  id: string;
  files: Array<FileData> = [];

  constructor(id: string) {
    this.id = id;
  }

  getFileByName = (name: string): FileData | undefined => {
    return this.files.find((file) => file.name === name);
  };
}

export { Directory, FileData };
