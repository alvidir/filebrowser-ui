import FileData from "@/domain/file";
import { pathSeparator } from "@/domain/path";

class Directory {
  id: string;
  path: string;
  files = new Array<FileData>();

  constructor(id: string, path: string) {
    this.id = id;
    this.path = path;
  }

  pathComponents = (): Array<string> => {
    return this.path.split(pathSeparator).filter((path) => path.length);
  };

  /**
   * Return true if, and only if, the directory's path is equal to '/'.
   *
   * @returns True if the firectory is root
   */
  isRoot = (): boolean => {
    return this.path === pathSeparator;
  };

  /**
   * Returns the directory's parent path if any.
   *
   * @returns The parent's path.
   */
  parentPath = (): string | undefined => {
    if (this.isRoot()) return;

    const index = this.path.lastIndexOf(pathSeparator);
    return this.path.substring(0, index);
  };

  /**
   * Returns the directory's name.
   *
   * @returns The parent's name.
   */
  name = (): string => {
    if (this.isRoot()) return "root";

    const index = this.path.lastIndexOf(pathSeparator);
    return this.path.substring(index + 1);
  };

  /**
   * Removes the given file instance, or any other with the same id from the
   * directory's array of files.
   *
   * @param file The file to be removed.
   */
  removeFile = (file: FileData) => {
    const index = this.files.findIndex(
      file.id
        ? (item) => item.id === file.id
        : (item) => item.name === file.name
    );

    if (index > -1) {
      this.files.splice(index, 1);
    }
  };

  /**
   * Adds a file instance into the directory's array of files.
   *
   * @param file The file to be added.
   */
  addFile = (file: FileData) => {
    this.files.push(file);
  };

  /**
   * Returns true if, and only if, the given filename already exists among all
   * the files into the directory. Otherwise False is returned.
   *
   * @param name - The filename to check.
   * @returns True if the given filename already exists.
   */
  exists = (name: string): boolean => {
    if (this.files.some((file) => file.name == name)) {
      return true;
    }

    return false;
  };
}

export default Directory;
