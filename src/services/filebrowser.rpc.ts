import * as grpcWeb from "grpc-web";
import { File, Permissions, FileMatch, getPath, isDirectory } from "@/file";
import { Warning, getWarning } from "@/warning";
import { DirectoryServiceClient } from "@/proto/DirectoryServiceClientPb";
import {
  Path as ProtoPath,
  Directory as ProtoDirectory,
  SearchRequest,
  SearchResponse,
  MoveRequest,
  SearchMatch as ProtoSearchMatch,
} from "@/proto/directory_pb";
import urlJoin from "url-join";
import { FileServiceClient } from "@/proto/FileServiceClientPb";
import { File as ProtoFile, Metadata as ProtoMetadata } from "@/proto/file_pb";
import config from "@/config.json";
import join from "url-join";
import * as path from "@/path";

const url = urlJoin(config.FILEBROWSER_BASE_URI, "rpc");

const directoryClient = new DirectoryServiceClient(url, null, null);
const fileClient = new FileServiceClient(url, null, null);

const headers: { [key: string]: string } = {};
if (process.env.NODE_ENV === "development") {
  headers["X-Uid"] = "1";
}

const underscoresToSpaces = (p: string): string => {
  return p.trim().replace(/_/g, " ");
};

const buildSearchMatch = (data: ProtoSearchMatch): FileMatch => {
  const protoFile = data.getFile();
  const file: File = protoFile ? buildFile(protoFile) : ({} as File);

  return {
    file: file,
    start: data.getMatchstart(),
    end: data.getMatchend(),
  };
};

const buildSearchMatches = (data: SearchResponse): Array<FileMatch> => {
  return data
    .getMatchesList()
    .filter((match) => !!match)
    .map((match) => buildSearchMatch(match));
};

const buildFile = (data: ProtoFile): File => {
  const file: File = {
    id: data.getId().length
      ? data.getId()
      : urlJoin(data.getDirectory(), data.getName()),
    name: underscoresToSpaces(data.getName()),
    directory: underscoresToSpaces(data.getDirectory()),
    metadata: new Map<string, string>(),
    permissions: new Map<number, Permissions>(),
    flags: data.getFlags(),
  };

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

  return file;
};

const removeFile = (file: File): Promise<void> => {
  return new Promise(
    (
      resolve: (value: void | PromiseLike<void>) => void,
      reject: (reason?: Warning) => void
    ) => {
      const request = new ProtoFile().setId(file.id);

      fileClient.delete(request, headers, (err: grpcWeb.RpcError) => {
        if (err && err.code !== grpcWeb.StatusCode.OK) {
          reject(getWarning(err.message));
          return;
        }

        resolve();
      });
    }
  );
};

const removeDirectory = (file: File): Promise<void> => {
  return new Promise(
    (
      resolve: (value: void | PromiseLike<void>) => void,
      reject: (reason?: Warning) => void
    ) => {
      const request = new ProtoPath().setAbsolute(
        path.sanatize(path.asDirectory(getPath(file)))
      );

      directoryClient.delete(request, headers, (err: grpcWeb.RpcError) => {
        if (err && err.code !== grpcWeb.StatusCode.OK) {
          reject(getWarning(err.message));
          return;
        }

        resolve();
      });
    }
  );
};

const buildDirectoryFiles = (data: ProtoDirectory): Array<File> => {
  return data.getFilesList().map((data) => {
    return buildFile(data);
  });
};

const getDirectory = (dir: string): Promise<Array<File>> => {
  dir = path.sanatize(dir);

  return new Promise(
    (
      resolve: (value: Array<File> | PromiseLike<Array<File>>) => void,
      reject: (reason: Warning) => void
    ) => {
      const absolute = path.asDirectory(dir);
      const request = new ProtoPath().setAbsolute(absolute);

      directoryClient.get(
        request,
        headers,
        (err: grpcWeb.RpcError, data: ProtoDirectory) => {
          if (err && err.code !== grpcWeb.StatusCode.OK) {
            reject(getWarning(err.message));
            return;
          }

          resolve(buildDirectoryFiles(data));
        }
      );
    }
  );
};

const createFile = (file: File): Promise<File> => {
  return new Promise(
    (
      resolve: (value: File | PromiseLike<File>) => void,
      reject: (reason: Warning) => void
    ) => {
      const metadata = new Array<ProtoMetadata>();
      file.metadata.forEach((value, key) => {
        metadata.push(new ProtoMetadata().setKey(key).setValue(value));
      });

      const request = new ProtoFile()
        .setName(path.display(file.name))
        .setDirectory(path.sanatize(getPath(file)))
        .setMetadataList(metadata);

      fileClient.create(
        request,
        headers,
        (err: grpcWeb.RpcError, data: ProtoFile) => {
          if (err && err.code !== grpcWeb.StatusCode.OK) {
            reject(getWarning(err.message));
            return;
          }

          resolve(buildFile(data));
        }
      );
    }
  );
};

const searchFile = (search: string): Promise<Array<FileMatch>> => {
  return new Promise(
    (
      resolve: (
        value: Array<FileMatch> | PromiseLike<Array<FileMatch>>
      ) => void,
      reject: (reason: Warning) => void
    ) => {
      search = path.clean(search);
      const request = new SearchRequest().setSearch(search);

      directoryClient.search(
        request,
        headers,
        (err: grpcWeb.RpcError, data: SearchResponse) => {
          if (err && err.code !== grpcWeb.StatusCode.OK) {
            reject(getWarning(err.message));
            return;
          }

          resolve(buildSearchMatches(data));
        }
      );
    }
  );
};

const renameFile = (file: File, name: string): Promise<void> => {
  return moveFile(file, join(file.directory, name));
};

const moveFile = (source: File, destination: string): Promise<void> => {
  return new Promise(
    (
      resolve: (value: void | PromiseLike<void>) => void,
      reject: (reason: Warning) => void
    ) => {
      const destPath = new ProtoPath().setAbsolute(path.sanatize(destination));
      const sourcePath = new ProtoPath().setAbsolute(
        path.sanatize(
          isDirectory(source)
            ? getPath(source)
            : path.asDirectory(getPath(source))
        )
      );

      const request = new MoveRequest()
        .setPathsList([sourcePath])
        .setDestination(destPath);

      directoryClient.move(request, headers, (err: grpcWeb.RpcError) => {
        if (err && err.code !== grpcWeb.StatusCode.OK) {
          reject(getWarning(err.message));
          return;
        }

        resolve();
      });
    }
  );
};

const deleteFile = (file: File): Promise<void> => {
  if (isDirectory(file)) return removeDirectory(file);
  else return removeFile(file);
};

export {
  getDirectory,
  createFile,
  searchFile,
  renameFile,
  moveFile,
  deleteFile,
};
