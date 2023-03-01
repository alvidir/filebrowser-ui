import * as grpcWeb from "grpc-web";
import Directory from "@/domain/directory";
import FileData from "@/domain/file";
import Warning from "@/domain/warning";
import { DirectoryClient } from "@/proto/DirectoryServiceClientPb";
import { DirectoryLocator, DirectoryDescriptor } from "@/proto/directory_pb";
import { FileClient } from "@/proto/FileServiceClientPb";
import { FileDescriptor, FileLocator } from "@/proto/file_pb";
import join from "url-join";
import Path from "@/domain/path";

type Headers = { [key: string]: string };

class FilebrowserClient {
  directoryClient: DirectoryClient;
  fileClient: FileClient;
  headers: Headers;

  constructor(url: string, headers: Headers) {
    this.directoryClient = new DirectoryClient(url, null, null);
    this.fileClient = new FileClient(url, null, null);
    this.headers = headers;
  }

  static underscoresToSpaces(p: string): string {
    return p.trim().replace(/_/g, " ");
  }

  static buildRelocateFilter(source: FileData): string {
    const directory = Path.sanatize(source.directory.path);
    const filename = Path.spacesToUnderscores(source.name);
    return `^${join(directory, `(${filename}`)}(/.*)?)$`;
  }

  static buildRenameDirFilter = (dir: FileData): string => {
    const path = Path.sanatize(dir.path());
    return `^${path}(/.*)?$`;
  };

  static buildRenameFileFilter = (file: FileData): string => {
    const path = Path.sanatize(file.path());
    return `^(${path}(/.*)?)$`;
  };

  static buildFile(dir: Directory, data: FileDescriptor): FileData {
    const filename = FilebrowserClient.underscoresToSpaces(data.getName());
    const file = new FileData(data.getId(), filename, dir);

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

  static buildDirectory(data: DirectoryDescriptor, path: string): Directory {
    path = FilebrowserClient.underscoresToSpaces(path);
    const dir = new Directory(data.getId(), path);

    data.getFilesList().forEach((file) => {
      dir.files.push(FilebrowserClient.buildFile(dir, file));
    });

    return dir;
  }

  retrieve = (path: string): Promise<Directory> => {
    return new Promise(
      (
        resolve: (value: Directory | PromiseLike<Directory>) => void,
        reject: (reason: Warning) => void
      ) => {
        const request = new DirectoryLocator().setPath(Path.sanatize(path));

        this.directoryClient.retrieve(
          request,
          this.headers,
          (err: grpcWeb.RpcError, data: DirectoryDescriptor) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(Warning.find(err.message));
              return;
            }

            resolve(FilebrowserClient.buildDirectory(data, path));
          }
        );
      }
    );
  };

  search = (search: string): Promise<Array<FileData>> => {
    return new Promise(
      (
        resolve: (
          value: Array<FileData> | PromiseLike<Array<FileData>>
        ) => void,
        reject: (reason: Warning) => void
      ) => {
        search = Path.spacesToUnderscores(search);
        const request = new DirectoryLocator().setFilter(search);

        this.directoryClient.retrieve(
          request,
          this.headers,
          (err: grpcWeb.RpcError, data: DirectoryDescriptor) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(Warning.find(err.message));
              return;
            }

            resolve(FilebrowserClient.buildDirectory(data, "").files);
          }
        );
      }
    );
  };

  rename = (file: FileData, name: string): Promise<void> => {
    return new Promise(
      (
        resolve: (value: void | PromiseLike<void>) => void,
        reject: (reason: Warning) => void
      ) => {
        const filter = file.isDirectory()
          ? FilebrowserClient.buildRenameDirFilter(file)
          : FilebrowserClient.buildRenameFileFilter(file);

        const dest = Path.sanatize(join(file.directory.path, name));
        const request = new DirectoryLocator().setFilter(filter).setPath(dest);

        this.directoryClient.relocate(
          request,
          this.headers,
          (err: grpcWeb.RpcError) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(Warning.find(err.message));
              return;
            }

            resolve();
          }
        );
      }
    );
  };

  relocate = (source: FileData, dest: string): Promise<void> => {
    return new Promise(
      (
        resolve: (value: void | PromiseLike<void>) => void,
        reject: (reason: Warning) => void
      ) => {
        const request = new DirectoryLocator()
          .setFilter(FilebrowserClient.buildRelocateFilter(source))
          .setPath(Path.sanatize(dest));

        this.directoryClient.relocate(
          request,
          this.headers,
          (err: grpcWeb.RpcError) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(Warning.find(err.message));
              return;
            }

            resolve();
          }
        );
      }
    );
  };

  delete = (file: FileData): Promise<void> => {
    if (file.isDirectory()) return this.removeDirectory(file);
    else return this.removeFile(file);
  };

  private removeFile = (file: FileData): Promise<void> => {
    return new Promise(
      (
        resolve: (value: void | PromiseLike<void>) => void,
        reject: (reason?: Warning) => void
      ) => {
        const request = new FileLocator().setTarget(file.id);

        this.fileClient.delete(
          request,
          this.headers,
          (err: grpcWeb.RpcError) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(Warning.find(err.message));
              return;
            }

            resolve();
          }
        );
      }
    );
  };

  private removeDirectory = (file: FileData): Promise<void> => {
    return new Promise(
      (
        resolve: (value: void | PromiseLike<void>) => void,
        reject: (reason?: Warning) => void
      ) => {
        const request = new DirectoryLocator().setPath(
          Path.sanatize(file.path())
        );

        this.directoryClient.removeFiles(
          request,
          this.headers,
          (err: grpcWeb.RpcError) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(Warning.find(err.message));
              return;
            }

            resolve();
          }
        );
      }
    );
  };
}

export default FilebrowserClient;
