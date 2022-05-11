import * as grpcWeb from 'grpc-web';
import { DirectoryClient } from './proto/DirectoryServiceClientPb';
import { DirectoryLocator, DirectoryDescriptor } from './proto/directory_pb';
import { FileClient } from './proto/FileServiceClientPb';
import { FileLocator, FileDescriptor } from './proto/file_pb';

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

class FilebrowserService {
    directoryClient: DirectoryClient;
    fileClient: FileClient;

    constructor(url: string) {
        this.directoryClient = new DirectoryClient(url, null, null);
        this.fileClient = new FileClient(url, null, null);
    }

    describeDirectory(headers: any = {}, fn: (err: grpcWeb.RpcError, response: DirectoryDescriptor) => void): void {
        const request = new DirectoryLocator()
        const call = this.directoryClient.describe(request, headers, fn);
    }
}

export default FilebrowserService
export {
    Error,
}