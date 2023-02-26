import * as constants from "@/constants";
import * as utils from "@/utils";
import Directory from "@/domain/directory";
import FileData from "@/domain/file";
import Warning from "@/domain/warning";
import join from "url-join";

const pathCleanRegex = new RegExp(constants.pathSeparator + "{1,}", "g");
const filenameRegex = /^[a-zA-Z0-9-_]*$/;
const maxFilenameLen = 36;

interface FilebrowserClient {
  getDirectoryByPath(path: string): Promise<Directory>;
  rename(file: FileData, filename: string): Promise<void>;
  relocate(source: FileData, dest: string): Promise<void>;
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
  private url: URL = new URL(window.location.href);

  constructor(fbClient: FilebrowserClient, warnCtrl: WarningController) {
    this.filebrowserClient = fbClient;
    this.warningController = warnCtrl;
  }

  static sanatizePath = (path: string): string => {
    path = utils.spacesToUnderscores(
      path.replace(pathCleanRegex, constants.pathSeparator).trim()
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
    return utils.underscoresToSpaces(this.url.pathname);
  };

  setPath = (path: string) => {
    path = DirectoryController.sanatizePath(path);
    window.history.pushState("", "", path);
    this.url = new URL(window.location.href);
    this.broadcast();
  };

  getDirectory = (): Directory | undefined => {
    const target = this.url.pathname;
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

    if (!name.match(filenameRegex)) {
      return "A name cannot contains special characters.";
    }

    if (name.length > maxFilenameLen) {
      return `A name cannot exceed ${maxFilenameLen} characters long.`;
    }

    if (this.getDirectory()?.files.some((file) => file.name == name)) {
      return "Name already exists";
    }
  };

  openfile = (file: FileData) => {
    if (file.isParentDirectory()) {
      this.setPath(
        file.directory.slice(
          0,
          file.directory.lastIndexOf(constants.pathSeparator)
        )
      );
    } else if (file.isDirectory()) {
      this.setPath(join(file.directory, file.name));
    } else if (file.url()) {
      window.open(file.url(), "_blank")?.focus();
    }
  };

  changeDirectory = (delta: number) => {
    const path = join(
      this.url.pathname.split(constants.pathSeparator).slice(0, -delta)
    );

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
    const dest = target.isParentDirectory()
      ? target.directory
      : join(target.directory, target.name);

    this.filebrowserClient
      .relocate(source, dest)
      .then(() => {
        this.dirs.get(source.directory)?.removeFile(source);
        source.directory = dest;

        this.dirs.get(dest)?.addFile(source);
        this.broadcast();
      })
      .catch((error: Warning) => {
        this.warningController.pushWarning(error);
      });
  };

  delete = (file: FileData) => {
    console.log("delete file");
  };
}

export default DirectoryController;
export { Listener };
