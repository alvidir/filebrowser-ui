enum Errors {
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

const warnings: { [key: string]: Warning } = {
  [Errors.ErrUnknown]: {
    title: "Something bad did happen",
    text: "We could not proceed with your request, please try again.",
    level: "error",
  },
  [Errors.ErrNotFound]: {
    title: "Forbidden",
    text: "You do not have permissions to execute this action. Make sure you are properly authenticated.",
    level: "error",
  },
  [Errors.ErrNotAvailable]: {
    title: "Verification required",
    text: "We just sent to you a verification email. Use the link provided there to complete the action.",
  },
  [Errors.ErrUnauthorized]: {
    title: "2FA required",
    text: "We need you to provide the 6-code in order to proceed with your request.",
  },
  [Errors.ErrInvalidToken]: {
    title: "Forbidden",
    text: "You do not have permissions to execute this action. Make sure you are properly authenticated.",
    level: "error",
  },
  [Errors.ErrInvalidFormat]: {
    title: "Invalid format",
    text: "Some of the credentials you just provided do not have the expected format. Make sure you wrote them properly.",
    level: "error",
  },
  [Errors.ErrInvalidHeader]: {
    title: "Forbidden",
    text: "You do not have permissions to execute this action. Make sure you are properly authenticated.",
    level: "error",
  },
  [Errors.ErrWrongCredentials]: {
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
    return warnings[code] ?? warnings[Errors.ErrUnknown];
  };
}

export default Warning;
