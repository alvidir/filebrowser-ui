enum Error {
  ErrUnknown = "E001",
  ErrNotFound = "E002",
  ErrNotAvailable = "E003",
  ErrUnauthorized = "E004",
  ErrInvalidToken = "E005",
  ErrInvalidFormat = "E006",
  ErrInvalidHeader = "E007",
  ErrWrongCredentials = "E008",
  ErrRegexNotMatch = "E009",
}

interface WarningProps {
  title: string;
  text: string;
  level?: string;
}

const warnings: { [key: string]: WarningProps } = {
  [Error.ErrUnknown]: {
    title: "Something bad did happen",
    text: "We could not proceed with your request, please try again.",
    level: "error",
  },
  [Error.ErrNotFound]: {
    title: "Forbidden",
    text: "You do not have permissions to execute this action. Make sure you are properly authenticated.",
    level: "error",
  },
  [Error.ErrNotAvailable]: {
    title: "Verification required",
    text: "We just sent to you a verification email. Use the link provided there to complete the action.",
  },
  [Error.ErrUnauthorized]: {
    title: "2FA required",
    text: "We need you to provide the 6-code in order to proceed with your request.",
  },
  [Error.ErrInvalidToken]: {
    title: "Forbidden",
    text: "You do not have permissions to execute this action. Make sure you are properly authenticated.",
    level: "error",
  },
  [Error.ErrInvalidFormat]: {
    title: "Invalid format",
    text: "Some of the credentials you just provided do not have the expected format. Make sure you wrote them properly.",
    level: "error",
  },
  [Error.ErrInvalidHeader]: {
    title: "Forbidden",
    text: "You do not have permissions to execute this action. Make sure you are properly authenticated.",
    level: "error",
  },
  [Error.ErrWrongCredentials]: {
    title: "Invalid username or password",
    text: "We could not identify you. Make sure all your credentials are well written.",
    level: "error",
  },
};

class Warning {
  title: string;
  text: string;
  level?: string;

  constructor(title: string, text: string) {
    this.title = title;
    this.text = text;
  }

  static find = (code: string): Warning => {
    return Object.assign(
      new Warning("", ""),
      warnings[code] ?? warnings[Error.ErrUnknown]
    );
  };
}

export default Warning;
