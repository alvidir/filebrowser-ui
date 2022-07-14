import * as grpcWeb from "grpc-web";
import { DirectoryClient } from "./proto/DirectoryServiceClientPb";
import { DirectoryLocator, DirectoryDescriptor } from "./proto/directory_pb";
import { FileClient } from "./proto/FileServiceClientPb";
import { Error, Directory } from "./model";

class FilebrowserService {
  directoryClient: DirectoryClient;
  fileClient: FileClient;

  constructor(url: string) {
    this.directoryClient = new DirectoryClient(url, null, null);
    this.fileClient = new FileClient(url, null, null);
  }

  async getDirectory(headers: any = {}): Promise<Directory> {
    const promise: Promise<Directory> = new Promise((resolve, reject) => {
      const handler = (
        err: grpcWeb.RpcError,
        response: DirectoryDescriptor
      ): void => {
        if (err.code !== grpcWeb.StatusCode.OK) {
          reject(err.message as Error);
          return;
        }

        const directory = new Directory(
          response.getId(),
          response.getFilesMap()
        );

        resolve(directory);
      };

      const request = new DirectoryLocator();
      this.directoryClient.describe(request, headers, handler);
    });

    return promise;
  }
}

export default FilebrowserService;
export { Error };
