import * as constants from "@/constants";
import * as utils from "@/utils";
import { Directory } from "@/domain/directory";
import { Warning } from "@/domain/warning";

const PATH_SEPARATOR = "/";
const PATH_REPLACE_REGEX = new RegExp(PATH_SEPARATOR + "{1,}", "g");
const MAX_FILENAME_LEN = 36;
const FILENAME_REGEX = /^[a-zA-Z0-9-_]*$/;

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
  private path: string = PATH_SEPARATOR;
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

  getPath(): string {
    return utils.underscoresToSpaces(this.path);
  }

  setPath(path: string) {
    path = utils.spacesToUnderscores(
      path.replace(PATH_REPLACE_REGEX, PATH_SEPARATOR).trim()
    );

    if (path[0] != PATH_SEPARATOR) {
      path = PATH_SEPARATOR.concat(path);
    }

    this.path = path;
  }

  getDirectory(): Directory | undefined {
    const target = this.path;
    if (this.dirs.get(target) === undefined) {
      this.getDirectoryByPath(target);
    }

    return this.dirs.get(target);
  }

  checkFilename(name: string): string | undefined {
    name = utils.spacesToUnderscores(name);
    if (!name.match(FILENAME_REGEX)) {
      return "A name cannot contains special characters.";
    }

    if (name.length > MAX_FILENAME_LEN) {
      return `A name cannot exceed ${MAX_FILENAME_LEN} characters long.`;
    }

    if (this.getDirectory()?.files.some((file) => file.name == name)) {
      return "Name already exists";
    }
  }
}

export default DirectoryController;
