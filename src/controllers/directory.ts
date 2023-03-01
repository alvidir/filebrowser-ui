import Directory from "@/domain/directory";
import FileData from "@/domain/file";
import Warning from "@/domain/warning";
import Subject from "@/controllers/observer";
import urlJoin from "url-join";
import Path, { pathSeparator } from "@/domain/path";

interface FilebrowserClient {
  retrieve(path: string): Promise<Directory>;
  rename(file: FileData, filename: string): Promise<void>;
  relocate(source: FileData, dest: string): Promise<void>;
  delete(file: FileData): Promise<void>;
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
      .retrieve(path)
      .then((dir) => {
        this.dirs.set(path, dir);
        this.broadcast();
      })
      .catch((error: Warning) => {
        this.warningController.push(error);
      });
  };

  private setPath = (path: string) => {
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
      this.setPath(Path.sanatize(urlJoin(file.directory.path, file.name)));
    }
  };

  changeDirectory = (delta: number) => {
    const path = urlJoin(this.path.split(pathSeparator).slice(0, delta));

    this.setPath(path);
  };

  rename = (file: FileData, filename: string) => {
    if (file.checkName(filename)) return;

    this.filebrowserClient
      .rename(file, filename)
      .then(() => {
        file.name = filename;
        this.broadcast();
      })
      .catch((error: Warning) => {
        this.warningController.push(error);
      });
  };

  relocate = (source: FileData, target: FileData) => {
    const dest = Path.sanatize(
      target.isParentDirectory()
        ? target.directory.path
        : urlJoin(target.directory.path, target.name)
    );

    this.filebrowserClient
      .relocate(source, dest)
      .then(() => {
        const path = Path.sanatize(source.directory.path);
        this.dirs.get(path)?.removeFile(source);

        const directory = this.dirs.get(dest);
        if (directory) {
          source.directory = directory;
          directory.addFile(source);
        }

        this.broadcast();
      })
      .catch((error: Warning) => {
        this.warningController.push(error);
      });
  };

  delete = (file: FileData) => {
    this.filebrowserClient
      .delete(file)
      .then(() => {
        const path = Path.sanatize(file.directory.path);
        this.dirs.get(path)?.removeFile(file);
        this.broadcast();
      })
      .catch((error: Warning) => {
        this.warningController.push(error);
      });
  };

  addFile = (file: FileData) => {
    const path = Path.sanatize(file.directory.path);
    this.dirs.get(path)?.files.push(file);
    this.broadcast();
  };
}

export default DirectoryController;
