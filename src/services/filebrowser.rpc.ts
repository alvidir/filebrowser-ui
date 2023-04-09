import * as grpcWeb from "grpc-web";
import FileData from "@/domain/file";
import Warning from "@/domain/warning";
import { DirectoryServiceClient } from "@/proto/DirectoryServiceClientPb";
import {
  Path as ProtoPath,
  Directory as ProtoDirectory,
  SearchRequest,
  SearchResponse,
  MoveRequest,
  SearchMatch as ProtoSearchMatch,
} from "@/proto/directory_pb";
import { FileServiceClient } from "@/proto/FileServiceClientPb";
import { File as ProtoFile, Metadata as ProtoMetadata } from "@/proto/file_pb";
import join from "url-join";
import Path from "@/domain/path";
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

  private static underscoresToSpaces(p: string): string {
    return p.trim().replace(/_/g, " ");
  }

  private static buildSearchMatch(data: ProtoSearchMatch): SearchMatch {
    const protoFile = data.getFile();
    const file = protoFile
      ? FilebrowserClient.buildFile(protoFile)
      : new FileData("", "", "");

    return new SearchMatch(file, data.getMatchstart(), data.getMatchend());
  }

  private static buildSearchMatches(data: SearchResponse): Array<SearchMatch> {
    return data
      .getMatchesList()
      .filter((match) => !!match)
      .map((match) => FilebrowserClient.buildSearchMatch(match));
  }

  private static buildFile(data: ProtoFile): FileData {
    const file = new FileData(
      data.getId(),
      FilebrowserClient.underscoresToSpaces(data.getName()),
      FilebrowserClient.underscoresToSpaces(data.getDirectory())
    );

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

  private static buildFiles(data: ProtoDirectory): Array<FileData> {
    return data.getFilesList().map((data) => {
      return FilebrowserClient.buildFile(data);
    });
  }

  getDirectory = (path: string): Promise<Array<FileData>> => {
    path = Path.sanatize(path);

    return new Promise(
      (
        resolve: (
          value: Array<FileData> | PromiseLike<Array<FileData>>
        ) => void,
        reject: (reason: Warning) => void
      ) => {
        const absolute = Path.asDirectory(path);
        const request = new ProtoPath().setAbsolute(absolute);

        this.directoryClient.get(
          request,
          this.headers,
          (err: grpcWeb.RpcError, data: ProtoDirectory) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(Warning.find(err.message));
              return;
            }

            resolve(FilebrowserClient.buildFiles(data));
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
          .setDirectory(Path.sanatize(file.path()))
          .setMetadataList(metadata);

        this.fileClient.create(
          request,
          this.headers,
          (err: grpcWeb.RpcError, data: ProtoFile) => {
            if (err && err.code !== grpcWeb.StatusCode.OK) {
              reject(Warning.find(err.message));
              return;
            }

            resolve(FilebrowserClient.buildFile(data));
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

  renameFile = (file: FileData, name: string): Promise<void> => {
    return this.moveFile(file, join(file.directory, name));
  };

  moveFile = (source: FileData, destination: string): Promise<void> => {
    return new Promise(
      (
        resolve: (value: void | PromiseLike<void>) => void,
        reject: (reason: Warning) => void
      ) => {
        const path = new ProtoPath().setAbsolute(
          Path.sanatize(
            source.isDirectory()
              ? Path.asDirectory(source.path())
              : source.path()
          )
        );

        const dest = new ProtoPath().setAbsolute(Path.sanatize(destination));

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

            resolve();
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
          Path.sanatize(Path.asDirectory(file.path()))
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
