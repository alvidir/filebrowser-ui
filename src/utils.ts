import * as constants from "./constants";

const PATH_REPLACE_REGEX = new RegExp(constants.PATH_SEPARATOR + "{1,}", "g");

export function normalizePath(path: string): string {
  let normalized = path.replace(PATH_REPLACE_REGEX, constants.PATH_SEPARATOR);

  if (normalized[0] != constants.PATH_SEPARATOR) {
    normalized = constants.PATH_SEPARATOR.concat(normalized);
  }

  return normalized;
}
