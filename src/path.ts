import urlJoin from "url-join";

const pathSeparator = "/";
const pathCleanRegex = new RegExp(pathSeparator + "{1,}", "g");
const rootDirName = "root";

const spacesToUnderscores = (path: string): string => {
  return path.trim().replace(/ /g, "_");
};

const underscoresToSpaces = (path: string): string => {
  return path.trim().replace(/_/g, " ");
};

const clean = (path: string): string => {
  path = path.replace(pathCleanRegex, pathSeparator);
  path = spacesToUnderscores(path);
  return path;
};

const sanatize = (path: string): string => {
  path = clean(path);
  path = absolute(path);
  return path;
};

const absolute = (path: string): string => {
  if (path[0] != pathSeparator) {
    path = pathSeparator.concat(path);
  }

  return path;
};

const asDirectory = (path: string): string => {
  if (path.at(-1) != pathSeparator) {
    return path + pathSeparator;
  }

  return path;
};

const split = (path: string): Array<string> => {
  return sanatize(path)
    .split(pathSeparator)
    .filter((value) => value.length);
};

const join = (...items: Array<string>): string => {
  return urlJoin(items);
};

const display = (path: string): string => {
  path = underscoresToSpaces(sanatize(path));
  if (path === pathSeparator) return rootDirName;
  return urlJoin(rootDirName, path);
};

export { sanatize, asDirectory, join, display, clean, split };
