import { Error } from "./filebrowser.service";

interface WarningProps {
  title: string;
  text: string;
  level?: string;
}

interface TagProps {
  tag: string;
  title?: string;
  description?: string;
  iconClass?: string;
  color?: string;
  active?: boolean;
}

const WARNING_PROPS: { [key: string]: WarningProps } = {
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

const enum TAGS {
  VIRTUAL = "virtual",
}

const TAG_PROPS: { [key: string]: TagProps } = {
  [TAGS.VIRTUAL]: {
    tag: TAGS.VIRTUAL,
    color: "var(--color-yellow)",
    title: "Is it alive or dead?",
    description:
      "A virtual folder only exists in you browser as long as you do not refresh the page. To persist the folder, add a file on it.",
    iconClass: "bx bxs-cat",
    active: true,
  },
};

interface DialogProps {
  title: string;
  subtitle: string;
  action: string;
  description: string;
  iconClass: string;
  color: string;
}

const enum DIALOGS {
  DELETE = "delete",
}

const DIALOGS_PROPS: { [key: string]: DialogProps } = {
  [DIALOGS.DELETE]: {
    action: DIALOGS.DELETE,
    color: "var(--color-red)",
    title: "Needs confirmation",
    subtitle: "Delete action on",
    description:
      "You are about to delete the folder /folder_name and the 2 files inside of it. Be aware that this action is permanent and cannot be undon.",
    iconClass: "bx bxs-castle",
  },
};

interface AppProps {
  id: string;
  title: string;
  icon: string;
  url: string;
}

const enum APPS {
  AGORA = "agora",
}

const APPS_PROPS = {
  [APPS.AGORA]: {
    id: "agora",
    title: "Agora",
    icon: "svg/greek_pillar.svg",
    url: "https://agora.alvidir.com",
  },
};

const PATH_SEPARATOR = "/";
const PARENT_DIRECTORY = "..";

export {
  TAGS,
  DIALOGS,
  APPS,
  WarningProps,
  TagProps,
  DialogProps,
  AppProps,
  TAG_PROPS,
  APPS_PROPS,
  DIALOGS_PROPS,
  PATH_SEPARATOR,
  PARENT_DIRECTORY,
  WARNING_PROPS,
};
