import * as constants from "@/constants";
import { Directory } from "@/domain/directory";
import { Warning } from "@/domain/warning";

const PATH_SEPARATOR = "/";
const PATH_REPLACE_REGEX = new RegExp(constants.PATH_SEPARATOR + "{1,}", "g");

interface FilebrowserClient {
  getDirectoryByPath(path: string): Promise<Directory>;
}

interface WarningController {
  pushWarning(warning: Warning): void;
}

class DirectoryController {
  private filebrowserClient: FilebrowserClient;
  private warningController: WarningController;
  private dirs: Map<string, Directory> = new Map();
  private fetching: boolean = false;

  constructor(fbClient: FilebrowserClient, warnCtrl: WarningController) {
    this.filebrowserClient = fbClient;
    this.warningController = warnCtrl;
  }

  private getDirectoryByPath(path: string) {
    this.fetching = true;

    this.filebrowserClient
      .getDirectoryByPath(path)
      .then((dir) => {
        this.dirs.set(path, dir);
      })
      .catch((error) =>
        this.warningController.pushWarning(constants.WARNINGS[error])
      )
      .finally(() => {
        this.fetching = false;
      });
  }

  cleanPath(path: string): string {
    path = path
      .replace(PATH_REPLACE_REGEX, PATH_SEPARATOR)
      .replace(/ /g, "_")
      .trim();

    if (path[0] != PATH_SEPARATOR) {
      path = PATH_SEPARATOR.concat(path);
    }

    return path;
  }

  getDirectory(path: string): Directory | undefined {
    path = this.cleanPath(path);

    if (this.dirs.get(path) === undefined) {
      this.getDirectoryByPath(path);
    }

    return this.dirs.get(path);
  }
}

export default DirectoryController;
