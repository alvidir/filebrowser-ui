import { Error } from "./services/filebrowser";
import Config from "./config.json";
import { Warning } from "./domain/warning";
import { Tag } from "./domain/tag";
import { Tool } from "./domain/tool";

const WARNINGS: { [key: string]: Warning } = {
  [Error.ERR_UNKNOWN]: {
    title: "Something bad did happen",
    text: "We could not proceed with your request, please try again.",
    level: "error",
  },
  [Error.ERR_NOT_FOUND]: {
    title: "Forbidden",
    text: "You do not have permissions to execute this action. Make sure you are properly authenticated.",
    level: "error",
  },
  [Error.ERR_NOT_AVAILABLE]: {
    title: "Verification required",
    text: "We just sent to you a verification email. Use the link provided there to complete the action.",
  },
  [Error.ERR_UNAUTHORIZED]: {
    title: "2FA required",
    text: "We need you to provide the 6-code in order to proceed with your request.",
  },
  [Error.ERR_INVALID_TOKEN]: {
    title: "Forbidden",
    text: "You do not have permissions to execute this action. Make sure you are properly authenticated.",
    level: "error",
  },
  [Error.ERR_INVALID_FORMAT]: {
    title: "Invalid format",
    text: "Some of the credentials you just provided do not have the expected format. Make sure you wrote them properly.",
    level: "error",
  },
  [Error.ERR_INVALID_HEADER]: {
    title: "Forbidden",
    text: "You do not have permissions to execute this action. Make sure you are properly authenticated.",
    level: "error",
  },
  [Error.ERR_WRONG_CREDENTIALS]: {
    title: "Invalid username or password",
    text: "We could not identify you. Make sure all your credentials are well written.",
    level: "error",
  },
};

const TAGS: { [key: string]: Tag } = {
  virtual: {
    tag: "virtual",
    color: "var(--color-yellow)",
    title: "Is it alive or dead?",
    description:
      "A virtual folder only exists in you browser as long as you do not refresh the page. To persist the folder, add a file on it.",
    iconClass: "bx bxs-cat",
    active: true,
  },
};

const TOOLS: { [key: string]: Tool } = {
  agora: {
    id: "agora",
    name: "Agora",
    iconUri: Config.AGORA_LOGO_URI,
    baseUri: Config.AGORA_BASE_URI,
  },
};

const PATH_SEPARATOR = "/";
const PARENT_DIRECTORY = "..";
const DEFAULT_PROJECT_NAME = "Untitled project";
const SEARCH_DEBOUNCE = 300;

export { TOOLS, TAGS, WARNINGS, PATH_SEPARATOR, PARENT_DIRECTORY };
