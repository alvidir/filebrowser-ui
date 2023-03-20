import Directory from "@/domain/directory";
import FileData, { metadataSizeKey } from "@/domain/file";
import Warning from "@/domain/warning";
import Subject from "@/controllers/observer";
import urlJoin from "url-join";
import Path, { pathSeparator } from "@/domain/path";

interface FilebrowserClient {
  getDirectory: (path: string) => Promise<Directory>;
  renameFile: (file: FileData, filename: string) => Promise<Directory>;
  moveFile: (source: FileData, dest: string) => Promise<Directory>;
  deleteFile: (file: FileData) => Promise<void>;
  createFile: (file: FileData) => Promise<FileData>;
}

interface WarningController {
  push(warning: Warning): void;
}

class DirectoryController extends Subject {
  private filebrowserClient: FilebrowserClient;
  private warningController: WarningController;
  private dirs: Map<string, Directory> = new Map();
  private path = window.location.pathname;

  constructor(fbClient: FilebrowserClient, warnCtrl: WarningController) {
    super();

    this.filebrowserClient = fbClient;
    this.warningController = warnCtrl;
  }

  private fetchDirectory = (path: string) => {
    this.filebrowserClient
      .getDirectory(path)
      .then((dir) => {
        this.dirs.set(path, dir);
        this.broadcast();
      })
      .catch((error: Warning) => {
        this.warningController.push(error);
      });
  };

  private setPath = (path: string) => {
    // ensure new files are not revealed more than once
    this.getDirectory()?.files.forEach((file) => (file.new = false));

    window.history.pushState("", "", Path.sanatize(path));
    this.path = window.location.pathname;
    this.broadcast();
  };

  getDirectory = (): Directory | undefined => {
    const directory = this.dirs.get(this.path);
    if (!directory) {
      this.fetchDirectory(this.path);
    }

    return directory;
  };

  openfile = (file: FileData) => {
    if (file.isParentDirectory()) {
      this.changeDirectory(-1);
    } else if (file.isDirectory()) {
      this.setPath(Path.sanatize(file.path()));
    } else {
      window.open(file.url() ?? "#", "_blank")?.focus();
    }
  };

  changeDirectory = (delta: number) => {
    const path = urlJoin(this.path.split(pathSeparator).slice(0, delta));
    this.setPath(path);
  };

  renameFile = (file: FileData, filename: string) => {
    if (file.checkName(filename)) return;

    this.filebrowserClient
      .renameFile(file, filename)
      .then(() => {
        file.name = filename;
        this.broadcast();
      })
      .catch((error: Warning) => {
        this.warningController.push(error);
      });
  };

  moveFile = (source: FileData, target: FileData) => {
    const targetDir = source.isDirectory() ? source.name : "";
    const targetPath = target.isParentDirectory()
      ? target.directory
      : urlJoin(target.directory, target.name);

    const dest = new Path(urlJoin(targetPath, targetDir)).asDirectory();

    this.filebrowserClient
      .moveFile(source, dest)
      .then(() => {
        const path = Path.sanatize(source.directory);
        this.dirs.get(path)?.removeFile(source);

        const directory = this.dirs.get(dest);
        if (directory) {
          source.directory = directory.path;
          directory.addFile(source);
        }

        this.broadcast();
      })
      .catch((error: Warning) => {
        this.warningController.push(error);
      });
  };

  deleteFile = (file: FileData) => {
    this.filebrowserClient
      .deleteFile(file)
      .then(() => {
        const path = Path.sanatize(file.directory);
        this.dirs.get(path)?.removeFile(file);
        this.broadcast();
      })
      .catch((error: Warning) => {
        this.warningController.push(error);
      });
  };

  addFile = (file: FileData) => {
    file.new = true;

    const path = Path.sanatize(file.directory);
    const fileDir = this.dirs.get(path);
    if (!fileDir) return;

    fileDir.files.push(file);
    const parentPath = Path.sanatize(fileDir.parentPath() ?? "");
    if (parentPath) {
      const dirfile = this.dirs.get(parentPath)?.files.find((f) => {
        return f.path() == fileDir.path;
      });

      const size = +(dirfile?.metadata.get(metadataSizeKey) ?? "0") + 1;
      dirfile?.metadata.set(metadataSizeKey, size.toString());
    }

    this.broadcast();
  };

  createFile = (file: FileData) => {
    this.filebrowserClient
      .createFile(file)
      .then((file) => {
        this.addFile(file);
      })
      .catch((error: Warning) => {
        this.warningController.push(error);
      });
  };
}

export default DirectoryController;
