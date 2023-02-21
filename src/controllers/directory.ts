import * as constants from "@/constants";
import * as utils from "@/utils";
import Directory from "@/domain/directory";
import FileData from "@/domain/file";
import Warning from "@/domain/warning";

const PathCleanRegex = new RegExp(constants.pathSeparator + "{1,}", "g");
const FilenameRegex = /^[a-zA-Z0-9-_]*$/;
const MaxFilenameLen = 36;

interface FilebrowserClient {
  getDirectoryByPath(path: string): Promise<Directory>;
  rename(file: FileData, filename: string): Promise<void>;
}

interface WarningController {
  pushWarning(warning: Warning): void;
}

interface Listener {
  update(): void;
}

class DirectoryController {
  private filebrowserClient: FilebrowserClient;
  private warningController: WarningController;
  private dirs: Map<string, Directory> = new Map();
  private listeners: Array<Listener> = [];
  private path: string = constants.pathSeparator;

  constructor(fbClient: FilebrowserClient, warnCtrl: WarningController) {
    this.filebrowserClient = fbClient;
    this.warningController = warnCtrl;
  }

  static cleanPath = (path: string): string => {
    path = utils.spacesToUnderscores(
      path.replace(PathCleanRegex, constants.pathSeparator).trim()
    );

    if (path[0] != constants.pathSeparator) {
      path = constants.pathSeparator.concat(path);
    }

    return path;
  };

  private broadcast = () => {
    this.listeners.forEach((listener) => listener.update());
  };

  private getDirectoryByPath = (path: string) => {
    this.filebrowserClient
      .getDirectoryByPath(path)
      .then((dir) => {
        this.dirs.set(path, dir);
        this.broadcast();
      })
      .catch((error: Warning) => {
        this.warningController.pushWarning(error);
      });
  };

  setListener = (listener: Listener) => {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  };

  getPath = (): string => {
    return utils.underscoresToSpaces(this.path);
  };

  setPath = (path: string) => {
    this.path = DirectoryController.cleanPath(path);
    window.history.pushState("", "", this.path);
    this.broadcast();
  };

  getDirectory = (): Directory | undefined => {
    const target = this.path;
    if (this.dirs.get(target) === undefined) {
      this.getDirectoryByPath(target);
    }

    return this.dirs.get(target);
  };

  getFilenameError = (name: string): string | undefined => {
    name = utils.spacesToUnderscores(name);
    if (!name) {
      return "Filename cannot be empty";
    }

    if (!name.match(FilenameRegex)) {
      return "A name cannot contains special characters.";
    }

    if (name.length > MaxFilenameLen) {
      return `A name cannot exceed ${MaxFilenameLen} characters long.`;
    }

    if (this.getDirectory()?.files.some((file) => file.name == name)) {
      return "Name already exists";
    }
  };

  openfile = (file: FileData) => {
    if (file.isParentDirectory()) {
      this.setPath(
        this.path
          .split(constants.pathSeparator)
          .filter((dir) => dir.length)
          .slice(0, -1)
          .join(constants.pathSeparator)
      );
    } else if (file.isDirectory()) {
      this.setPath(`${this.path}/${file.name}`);
    } else if (file.url()) {
      window.open(file.url(), "_blank")?.focus();
    }
  };

  changeDirectory = (delta: number) => {
    const path = this.path
      .split(constants.pathSeparator)
      .slice(0, -delta)
      .join(constants.pathSeparator);

    this.setPath(path);
  };

  rename = (file: FileData, filename: string) => {
    this.filebrowserClient
      .rename(file, filename)
      .then(() => {
        file.name = filename;
        this.broadcast();
      })
      .catch((error: Warning) => {
        this.warningController.pushWarning(error);
      });
  };

  relocate = (source: FileData, target: FileData) => {
    console.log("relocate file");
  };

  delete = (file: FileData) => {
    console.log("delete file");
  };
}

export default DirectoryController;
export { Listener };
