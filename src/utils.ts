import * as constants from "./constants";

const PATH_REPLACE_REGEX = new RegExp(constants.PATH_SEPARATOR + "{1,}", "g");

type ValidateFn = (name: string) => string;

function cleanPath(path: string): string {
  let normalized = path.replace(PATH_REPLACE_REGEX, constants.PATH_SEPARATOR);

  if (normalized[0] != constants.PATH_SEPARATOR) {
    normalized = constants.PATH_SEPARATOR.concat(normalized);
  }

  return normalized;
}

function spacesToUnderscores(p: string): string {
  return p.trim().replace(/ /g, "_");
}

function underscoresToSpaces(p: string): string {
  return p.trim().replace(/_/g, " ");
}

function buildRelocateFilter(source: string[]): string {
  return `^${source.slice(0, -1).join(constants.PATH_SEPARATOR)}/(${
    source[source.length - 1]
  }(/.*)?)$`;
}

function buildRenameDirFilter(source: string[]): string {
  return `^${source.join(constants.PATH_SEPARATOR)}(/.*)?$`;
}

function buildRenameFileFilter(source: string[]): string {
  return `^(${source.join(constants.PATH_SEPARATOR)}(/.*)?)$`;
}

function directory(path: string): string {
  const dirs = path.split(constants.PATH_SEPARATOR);
  return underscoresToSpaces(`/${dirs[dirs.length - 1]}`);
}

// baseHeaders returns a dictionary with some default values depending on the environment
function baseHeaders(): { [key: string]: string } {
  const headers: { [key: string]: string } = {};
  if (process.env.NODE_ENV === "development") {
    headers["X-Uid"] = "1";
  }

  return headers;
}

export {
  ValidateFn,
  cleanPath,
  spacesToUnderscores,
  underscoresToSpaces,
  buildRelocateFilter,
  buildRenameDirFilter,
  buildRenameFileFilter,
  directory,
  baseHeaders,
};
