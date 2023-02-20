import * as constants from "@/constants";
import * as utils from "@/utils";
import { Directory, FileData } from "@/domain/directory";
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

interface Listener {
  update(): void;
}

class DirectoryController {
  private filebrowserClient: FilebrowserClient;
  private warningController: WarningController;
  private dirs: Map<string, Directory> = new Map();
  private listeners: Array<Listener> = [];
  private path: string = PATH_SEPARATOR;

  constructor(fbClient: FilebrowserClient, warnCtrl: WarningController) {
    this.filebrowserClient = fbClient;
    this.warningController = warnCtrl;
  }

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
      .catch((error) =>
        this.warningController.pushWarning(constants.WARNINGS[error])
      );
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
    path = utils.spacesToUnderscores(
      path.replace(PATH_REPLACE_REGEX, PATH_SEPARATOR).trim()
    );

    if (path[0] != PATH_SEPARATOR) {
      path = PATH_SEPARATOR.concat(path);
    }

    this.path = path;
    window.history.pushState("", "", path);
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

    if (!name.match(FILENAME_REGEX)) {
      return "A name cannot contains special characters.";
    }

    if (name.length > MAX_FILENAME_LEN) {
      return `A name cannot exceed ${MAX_FILENAME_LEN} characters long.`;
    }

    if (this.getDirectory()?.files.some((file) => file.name == name)) {
      return "Name already exists";
    }
  };

  openfile = (file: FileData) => {
    console.log("open file");
  };

  changeDirectory = (delta: number) => {
    const path = this.path
      .split(constants.PATH_SEPARATOR)
      .slice(0, -delta)
      .join(constants.PATH_SEPARATOR);

    this.setPath(path);
  };

  relocateFile = (source: FileData, target: FileData) => {
    console.log("relocate file");
  };

  renameFile = (file: FileData, filename: string) => {
    console.log("rename file");
  };

  deleteFile = (file: FileData) => {
    console.log("delete file");
  };
}

export default DirectoryController;
export { Listener };
