import * as grpcWeb from "grpc-web";
import Directory from "@/domain/directory";
import FileData from "@/domain/file";
import Warning from "@/domain/warning";
import { DirectoryServiceClient } from "@/proto/DirectoryServiceClientPb";
import {
  Path as ProtoPath,
  Directory as ProtoDirectory,
  SearchRequest,
  SearchResponse,
  MoveRequest,
} from "@/proto/directory_pb";
import { FileServiceClient } from "@/proto/FileServiceClientPb";
import { File as ProtoFile, Metadata as ProtoMetadata } from "@/proto/file_pb";
import join from "url-join";
import Path, { pathSeparator } from "@/domain/path";
import SearchMatch from "@/domain/search";

type Headers = { [key: string]: string };

class FilebrowserClient {
  directoryClient: DirectoryServiceClient;
  fileClient: FileServiceClient;
  headers: Headers;

  constructor(url: string, headers: Headers) {
    this.directoryClient = new DirectoryServiceClient(url, null, null);
    this.fileClient = new FileServiceClient(url, null, null);
    this.headers = headers;
  }

  static underscoresToSpaces(p: string): string {
    return p.trim().replace(/_/g, " ");
  }

  static buildSearchMatches(data: SearchResponse): Array<SearchMatch> {
    const items = new Array<SearchMatch>();
    data.getMatchesList().forEach((item) => {
      const protoFile = item.getFile();
      if (!protoFile) return;

      const file = new FileData(
        protoFile.getId(),
        protoFile.getName(),
        protoFile.getDirectory()
      );

      new SearchMatch(file, item.getMatchstart(), item.getMatchend());
    });

    return items;
  }

  private static buildDirectory(data: ProtoDirectory): Directory {
    const absolute = data.getPath()?.getAbsolute() ?? pathSeparator;
    const path = FilebrowserClient.underscoresToSpaces(absolute);
    const dir = new Directory(data.getId(), path);

    data.getFilesList().forEach((data) => {
      const file = new FileData("", "", "");
      dir.files.push(FilebrowserClient.initFile(file, data));
    });

    return dir;
  }

  private static initFile(file: FileData, data: ProtoFile): FileData {
    file.id = data.getId();
    file.name = FilebrowserClient.underscoresToSpaces(data.getName());
    file.directory = FilebrowserClient.underscoresToSpaces(data.getDirectory());

    data.getMetadataList().forEach((f) => {
      file.metadata.set(f.getKey(), f.getValue());
    });

    data.getPermissionsList().forEach((p) => {
      file.permissions.set(p.getUserId(), {
        read: p.getRead(),
        write: p.getWrite(),
        owner: p.getOwner(),
      });
    });

    file.flags = data.getFlags();
    return file;
  }

  getDirectory = (path: string): Promise<Directory> => {
    return new Promise(
      (
        resolve: (value: Directory | PromiseLike<Directory>) => void,
        reject: (reason: Warning) => void
      ) => {
        const absolute = new Path(path).asDirectory();
        const request = new ProtoPath().setAbsolute(absolute);

        this.directoryClient.get(
          request,
          this.headers,
          (err: grpcWeb.RpcError, data: ProtoDirectory) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(Warning.find(err.message));
              return;
            }

            resolve(FilebrowserClient.buildDirectory(data));
          }
        );
      }
    );
  };

  createFile = (file: FileData): Promise<FileData> => {
    return new Promise(
      (
        resolve: (value: FileData | PromiseLike<FileData>) => void,
        reject: (reason: Warning) => void
      ) => {
        const metadata = new Array<ProtoMetadata>();
        file.metadata.forEach((value, key) => {
          metadata.push(new ProtoMetadata().setKey(key).setValue(value));
        });

        const request = new ProtoFile()
          .setName(Path.spacesToUnderscores(file.name))
          .setDirectory(new Path(file.path()).absolute)
          .setMetadataList(metadata);

        this.fileClient.create(
          request,
          this.headers,
          (err: grpcWeb.RpcError, data: ProtoFile) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(Warning.find(err.message));
              return;
            }

            resolve(FilebrowserClient.initFile(file, data));
          }
        );
      }
    );
  };

  searchFile = (search: string): Promise<Array<SearchMatch>> => {
    return new Promise(
      (
        resolve: (
          value: Array<SearchMatch> | PromiseLike<Array<SearchMatch>>
        ) => void,
        reject: (reason: Warning) => void
      ) => {
        search = Path.spacesToUnderscores(search);
        const request = new SearchRequest().setSearch(search);

        this.directoryClient.search(
          request,
          this.headers,
          (err: grpcWeb.RpcError, data: SearchResponse) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(Warning.find(err.message));
              return;
            }

            resolve(FilebrowserClient.buildSearchMatches(data));
          }
        );
      }
    );
  };

  renameFile = (file: FileData, name: string): Promise<Directory> => {
    return this.moveFile(file, join(file.directory, name));
  };

  moveFile = (source: FileData, destination: string): Promise<Directory> => {
    return new Promise(
      (
        resolve: (value: Directory | PromiseLike<Directory>) => void,
        reject: (reason: Warning) => void
      ) => {
        const path = new ProtoPath().setAbsolute(
          source.isDirectory()
            ? new Path(source.path()).asDirectory()
            : new Path(source.path()).absolute
        );

        const dest = new ProtoPath().setAbsolute(
          new Path(destination).absolute
        );

        const request = new MoveRequest()
          .setPathsList([path])
          .setDestination(dest);

        this.directoryClient.move(
          request,
          this.headers,
          (err: grpcWeb.RpcError, data: ProtoDirectory) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(Warning.find(err.message));
              return;
            }

            resolve(FilebrowserClient.buildDirectory(data));
          }
        );
      }
    );
  };

  deleteFile = (file: FileData): Promise<void> => {
    if (file.isDirectory()) return this.removeDirectory(file);
    else return this.removeFile(file);
  };

  private removeFile = (file: FileData): Promise<void> => {
    return new Promise(
      (
        resolve: (value: void | PromiseLike<void>) => void,
        reject: (reason?: Warning) => void
      ) => {
        const request = new ProtoFile().setId(file.id);

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
        const request = new ProtoPath().setAbsolute(
          new Path(file.path()).asDirectory()
        );

        this.directoryClient.delete(
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
