import * as constants from "./constants";

const PATH_REPLACE_REGEX = new RegExp(constants.PATH_SEPARATOR + "{1,}", "g");

export type ValidateFn = (name: string) => string;

export function normalizePath(path: string): string {
  let normalized = path.replace(PATH_REPLACE_REGEX, constants.PATH_SEPARATOR);

  if (normalized[0] != constants.PATH_SEPARATOR) {
    normalized = constants.PATH_SEPARATOR.concat(normalized);
  }

  return normalized;
}

export function normalizeName(p: string): string {
  return p.trim().replace(/ /g, "_");
}

export function buildRelocateFilter(source: string[]): string {
  debugger;
  return `^${source
    .slice(0, -1)
    .join(constants.PATH_SEPARATOR)
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")}/(${source[source.length - 1]
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")}(/.*)?)$`;
}

export function buildRenameDirFilter(source: string[]): string {
  debugger;
  return `^${source
    .join(constants.PATH_SEPARATOR)
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")}(/.*)?$`;
}

export function buildRenameFileFilter(source: string[]): string {
  debugger;
  return `^(${source
    .join(constants.PATH_SEPARATOR)
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")}(/.*)?)$`;
}
