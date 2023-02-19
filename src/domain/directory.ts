const PARENT_DIRECTORY = "..";

enum Flags {
  Directory = 0x04,
}

enum MetadataKey {
  Url = "url",
  UpdatedAt = "updated_at",
  AppId = "app_id",
  Size = "size",
}

class Permissions {
  read: boolean = false;
  write: boolean = false;
  owner: boolean = false;
}

class FileData {
  id: string;
  name: string;
  metadata: Map<string, string> = new Map();
  permissions: Map<Number, Permissions> = new Map();
  flags: number = 0;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  size(): string | undefined {
    return this.metadata.get(MetadataKey.Size);
  }

  updatedAt(): Date {
    let unix = this.metadata.get(MetadataKey.UpdatedAt) ?? "0";
    return new Date(parseInt(unix, 16) * 1000);
  }

  isDirectory(): boolean {
    return (this.flags & Flags.Directory) != 0;
  }

  isParentDirectory(): boolean {
    return this.name == PARENT_DIRECTORY;
  }
}

class Directory {
  id: string;
  files: Array<FileData> = [];

  constructor(id: string) {
    this.id = id;
  }

  getFileByName(name: string): FileData | undefined {
    return this.files.find((file) => file.name === name);
  }
}

export { Directory, FileData };
