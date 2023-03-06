const pathSeparator = "/";
const pathCleanRegex = new RegExp(pathSeparator + "{1,}", "g");

class Path {
  absolute: string;

  constructor(path: string) {
    this.absolute = Path.sanatize(Path.spacesToUnderscores(path));
  }

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

  asDirectory = (): string => {
    if (this.absolute.at(-1) != pathSeparator) {
      return this.absolute + pathSeparator;
    }

    return this.absolute;
  };
}

export default Path;
export { pathSeparator };
