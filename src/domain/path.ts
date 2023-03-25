const pathSeparator = "/";
const pathCleanRegex = new RegExp(pathSeparator + "{1,}", "g");
const rootDirName = "root";

class Path {
  static spacesToUnderscores(p: string): string {
    return p.trim().replace(/ /g, "_");
  }

  static underscoresToSpaces(p: string): string {
    return p.trim().replace(/_/g, " ");
  }

  static sanatize(path: string): string {
    path = Path.spacesToUnderscores(
      path.replace(pathCleanRegex, pathSeparator)
    );

    if (path[0] != pathSeparator) {
      path = pathSeparator.concat(path);
    }

    return path;
  }

  static asDirectory(path: string): string {
    if (path.at(-1) != pathSeparator) {
      return path + pathSeparator;
    }

    return path;
  }
}

export default Path;
export { pathSeparator, rootDirName };
