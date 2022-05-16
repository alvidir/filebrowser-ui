enum Error {
  ERR_UNKNOWN = "E001",
  ERR_NOT_FOUND = "E002",
  ERR_NOT_AVAILABLE = "E003",
  ERR_UNAUTHORIZED = "E004",
  ERR_INVALID_TOKEN = "E005",
  ERR_INVALID_FORMAT = "E006",
  ERR_INVALID_HEADER = "E007",
  ERR_WRONG_CREDENTIALS = "E008",
  ERR_REGEX_NOT_MATCH = "E009",
}

class Directory {
  id: string;
  files: { [key: string]: FileDescriptor };

  constructor(id: string, files = {}) {
    this.id = id;
    this.files = files;
  }
}

class FileDescriptor {
  id: string;
  name: string;
  metadata: { [key: string]: string };
  permissions: { [key: number]: number };

  constructor(id: string, name: string, metadata = {}) {
    this.id = id;
    this.name = name;
    this.metadata = metadata;
    this.permissions = {};
  }
}

export { Error, Directory, FileDescriptor };
