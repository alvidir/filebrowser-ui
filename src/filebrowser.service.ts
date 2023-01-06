import * as grpcWeb from "grpc-web";
import { DirectoryClient } from "./proto/DirectoryServiceClientPb";
import { DirectoryLocator, DirectoryDescriptor } from "./proto/directory_pb";
import { FileClient } from "./proto/FileServiceClientPb";
import {
  FileConstructor,
  FileDescriptor,
  FileMetadata as ProtoFileMetadata,
} from "./proto/file_pb";

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

enum MetadataKey {
  Url = "url",
  UpdatedAt = "updated_at",
  AppId = "app_id",
  Size = "size",
}

type RpcMetadata = { [key: string]: string };

type Response = {
  data?: object;
  metadata?: FileMetadata[];
  error?: Error;
};

interface FileMetadata {
  key: string;
  value: string;
}

interface Permissions {
  read: boolean;
  write: boolean;
  owner: boolean;
}
interface FilePermissions {
  uid: number;
  permissions?: Permissions;
}

class File {
  id: string;
  name: string;
  metadata: FileMetadata[];
  permissions: FilePermissions[];
  flags: number;

  constructor(file: FileDescriptor) {
    this.id = file.getId();
    this.name = file.getName();
    this.metadata = file.getMetadataList().map((f) => f.toObject());
    this.permissions = file.getPermissionsList().map((p) => p.toObject());
    this.flags = file.getFlags();
  }

  getMetadata(key: MetadataKey): string | undefined {
    return this.metadata.find((meta) => meta.key == key.toString())?.value;
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

  getDirectory(
    path: string,
    filter: string,
    headers: RpcMetadata
  ): Promise<Directory> {
    return new Promise(
      (
        resolve: (value: Directory | PromiseLike<Directory>) => void,
        reject: (reason?: Error) => void
      ) => {
        const request = new DirectoryLocator().setFilter(filter).setPath(path);

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

  relocate(path: string, filter: string, headers: RpcMetadata): Promise<void> {
    return new Promise(
      (
        resolve: (value: void | PromiseLike<void>) => void,
        reject: (reason?: Error) => void
      ) => {
        const request = new DirectoryLocator().setFilter(filter).setPath(path);

        this.directoryClient.relocate(
          request,
          headers,
          (err: grpcWeb.RpcError) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(err.message as Error);
              return;
            }

            resolve();
          }
        );
      }
    );
  }

  createEmptyFile(
    path: string,
    metadata: FileMetadata[],
    headers: RpcMetadata
  ): Promise<File> {
    return new Promise(
      (
        resolve: (value: File | PromiseLike<File>) => void,
        reject: (reason?: Error) => void
      ) => {
        const request = new FileConstructor().setPath(path).setMetadataList(
          metadata.map((meta) => {
            return new ProtoFileMetadata()
              .setKey(meta.key)
              .setValue(meta.value);
          })
        );

        this.fileClient.create(
          request,
          headers,
          (err: grpcWeb.RpcError, data: FileDescriptor) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(err.message as Error);
              return;
            }

            console.log(data);
            resolve(new File(data));
          }
        );
      }
    );
  }
}

export default FilebrowserService;
export {
  Error,
  Directory,
  File,
  Response,
  FileMetadata,
  FilePermissions,
  MetadataKey,
  Flags,
};
