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

  getDirectory(
    headers: any = {},
    callback: (err: Error | null, response: Directory | null) => void
  ): void {
    const handler = (
      err: grpcWeb.RpcError,
      response: DirectoryDescriptor
    ): void => {
      console.log(err);
      console.log(response);

      if (err.code !== grpcWeb.StatusCode.OK) {
        callback(Error.ERR_UNKNOWN, null);
        return;
      }

      const directory = new Directory(response.getId(), response.getFilesMap());
      callback(null, directory);
      return;
    };

    const request = new DirectoryLocator();
    this.directoryClient.describe(request, headers, handler);
  }
}

export default FilebrowserService;
export { Error };
