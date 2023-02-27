import * as constants from "./constants";

function spacesToUnderscores(p: string): string {
  return p.trim().replace(/ /g, "_");
}

function underscoresToSpaces(p: string): string {
  return p.trim().replace(/_/g, " ");
}

function directory(path: string): string {
  const dirs = path.split(constants.pathSeparator);
  return underscoresToSpaces(`/${dirs.at(-1)}`);
}

export { spacesToUnderscores, underscoresToSpaces, directory };
