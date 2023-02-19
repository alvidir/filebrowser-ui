import * as constants from "./constants";

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
  spacesToUnderscores,
  underscoresToSpaces,
  buildRelocateFilter,
  buildRenameDirFilter,
  buildRenameFileFilter,
  directory,
  baseHeaders,
};
