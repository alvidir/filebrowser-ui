import * as constants from "./constants";

const PATH_REPLACE_REGEX = new RegExp(constants.PATH_SEPARATOR + "{1,}", "g");

export type ValidateFn = (name: string) => string;

export function cleanPath(path: string): string {
  let normalized = path.replace(PATH_REPLACE_REGEX, constants.PATH_SEPARATOR);

  if (normalized[0] != constants.PATH_SEPARATOR) {
    normalized = constants.PATH_SEPARATOR.concat(normalized);
  }

  return normalized;
}

export function spacesToUnderscores(p: string): string {
  return p.trim().replace(/ /g, "_");
}

export function underscoresToSpaces(p: string): string {
  return p.trim().replace(/_/g, " ");
}

export function buildRelocateFilter(source: string[]): string {
  return `^${source.slice(0, -1).join(constants.PATH_SEPARATOR)}/(${
    source[source.length - 1]
  }(/.*)?)$`;
}

export function buildRenameDirFilter(source: string[]): string {
  return `^${source.join(constants.PATH_SEPARATOR)}(/.*)?$`;
}

export function buildRenameFileFilter(source: string[]): string {
  return `^(${source.join(constants.PATH_SEPARATOR)}(/.*)?)$`;
}
