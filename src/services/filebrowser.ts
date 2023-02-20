import * as grpcWeb from "grpc-web";
import { Directory, FileData } from "@/domain/directory";
import { DirectoryClient } from "../proto/DirectoryServiceClientPb";
import { DirectoryLocator, DirectoryDescriptor } from "../proto/directory_pb";
import { FileClient } from "../proto/FileServiceClientPb";
import { FileDescriptor, FileLocator } from "../proto/file_pb";

type Headers = { [key: string]: string };

function newFile(data: FileDescriptor): FileData {
  const file = new FileData(data.getId(), data.getName());
  data.getMetadataList().forEach((f) => {
    file.metadata.set(f.getKey(), f.getValue());
  });

  data.getPermissionsList().forEach((p) => {
    const permissions = p.getPermissions();
    if (permissions)
      file.permissions.set(p.getUid(), {
        read: permissions.getRead(),
        write: permissions.getWrite(),
        owner: permissions.getOwner(),
      });
  });

  file.flags = data.getFlags();
  return file;
}

function newDirectory(data: DirectoryDescriptor): Directory {
  const dir = new Directory(data.getId());
  data.getFilesList().forEach((file) => {
    dir.files.push(newFile(file));
  });

  return dir;
}

class FilebrowserClient {
  directoryClient: DirectoryClient;
  fileClient: FileClient;
  headers: Headers;

  constructor(url: string, headers: Headers) {
    this.directoryClient = new DirectoryClient(url, null, null);
    this.fileClient = new FileClient(url, null, null);
    this.headers = headers;
  }

  getDirectoryByPath(path: string): Promise<Directory> {
    return new Promise(
      (
        resolve: (value: Directory | PromiseLike<Directory>) => void,
        reject: (reason?: string) => void
      ) => {
        const request = new DirectoryLocator().setPath(path);

        this.directoryClient.retrieve(
          request,
          this.headers,
          (err: grpcWeb.RpcError, data: DirectoryDescriptor) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(err.message);
              return;
            }

            resolve(newDirectory(data));
          }
        );
      }
    );
  }

  //   relocate(path: string, filter: string, headers: Headers): Promise<void> {
  //     return new Promise(
  //       (
  //         resolve: (value: void | PromiseLike<void>) => void,
  //         reject: (reason?: Error) => void
  //       ) => {
  //         const request = new DirectoryLocator().setFilter(filter).setPath(path);

  //         this.directoryClient.relocate(
  //           request,
  //           headers,
  //           (err: grpcWeb.RpcError) => {
  //             if (err && err.code !== grpcWeb.StatusCode.OK) {
  //               reject(err.message as Error);
  //               return;
  //             }

  //             resolve();
  //           }
  //         );
  //       }
  //     );
  //   }

  //   removeFile(fileId: string, headers: Headers): Promise<void> {
  //     return new Promise(
  //       (
  //         resolve: (value: void | PromiseLike<void>) => void,
  //         reject: (reason?: Error) => void
  //       ) => {
  //         const request = new FileLocator().setTarget(fileId);

  //         this.fileClient.delete(request, headers, (err: grpcWeb.RpcError) => {
  //           if (err && err.code !== grpcWeb.StatusCode.OK) {
  //             reject(err.message as Error);
  //             return;
  //           }

  //           resolve();
  //         });
  //       }
  //     );
  //   }

  //   removeDirectory(target: string, headers: Headers): Promise<void> {
  //     return new Promise(
  //       (
  //         resolve: (value: void | PromiseLike<void>) => void,
  //         reject: (reason?: Error) => void
  //       ) => {
  //         const request = new DirectoryLocator().setPath(target);

  //         this.directoryClient.removeFiles(
  //           request,
  //           headers,
  //           (err: grpcWeb.RpcError) => {
  //             if (err && err.code !== grpcWeb.StatusCode.OK) {
  //               reject(err.message as Error);
  //               return;
  //             }

  //             resolve();
  //           }
  //         );
  //       }
  //     );
  //   }
}

export default FilebrowserClient;
