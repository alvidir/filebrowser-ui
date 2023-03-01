const pathSeparator = "/";
const pathCleanRegex = new RegExp(pathSeparator + "{1,}", "g");

class Path {
  static spacesToUnderscores(p: string): string {
    return p.trim().replace(/ /g, "_");
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
}

export default Path;
export { pathSeparator };
