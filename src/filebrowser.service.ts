import * as grpcWeb from "grpc-web";
import { DirectoryClient } from "./proto/DirectoryServiceClientPb";
import { DirectoryLocator, DirectoryDescriptor } from "./proto/directory_pb";
import { FileClient } from "./proto/FileServiceClientPb";
import { FileDescriptor } from "./proto/file_pb";

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

enum Flags {
  Directory = 0x04,
}

type Metadata = { [key: string]: string };

type Response = {
  data?: object;
  metadata?: Metadata;
  error?: Error;
};

class File {
  id: string;
  name: string;
  metadata: { [key: string]: string };
  permissions: { [key: number]: number };
  flags: number;

  constructor(file: FileDescriptor) {
    this.id = file.getId();
    this.name = file.getName();
    this.metadata = file.getMetadataMap();
    this.permissions = file.getPermissionsMap();
    this.flags = file.getFlags();
  }
}

class Directory {
  id: string;
  files: Array<File>;

  constructor(dir: DirectoryDescriptor) {
    this.id = dir.getId();
    this.files = new Array(dir.getFilesList().length);
    dir.getFilesList().forEach((file) => {
      this.files.push(new File(file));
    });
  }
}

class FilebrowserService {
  directoryClient: DirectoryClient;
  fileClient: FileClient;

  constructor(url: string) {
    this.directoryClient = new DirectoryClient(url, null, null);
    this.fileClient = new FileClient(url, null, null);
  }

  getDirectory(path: string, headers: Metadata): Promise<Directory> {
    return new Promise(
      (
        resolve: (value: Directory | PromiseLike<Directory>) => void,
        reject: (reason?: Error) => void
      ) => {
        const request = new DirectoryLocator();
        request.setPath(path);

        this.directoryClient.retrieve(
          request,
          headers,
          (err: grpcWeb.RpcError, data: DirectoryDescriptor) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(err.message as Error);
              return;
            }

            resolve(new Directory(data));
          }
        );
      }
    );
  }
}

export default FilebrowserService;
export { Error, Directory, File as FileDescriptor, Response, Metadata, Flags };
