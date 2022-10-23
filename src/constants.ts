import { Error } from "./filebrowser.service";

interface WarningProp {
  title: string;
  text: string;
  level?: string;
}

const WARNING_PROPS: { [key: string]: WarningProp } = {
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

export { WARNING_PROPS, WarningProp };
