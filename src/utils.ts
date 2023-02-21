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

// baseHeaders returns a dictionary with some default values depending on the environment
function baseHeaders(): { [key: string]: string } {
  const headers: { [key: string]: string } = {};
  if (process.env.NODE_ENV === "development") {
    headers["X-Uid"] = "1";
  }

  return headers;
}

export { spacesToUnderscores, underscoresToSpaces, baseHeaders, directory };
