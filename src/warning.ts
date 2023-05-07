import i18n from "@/i18n/en.json";

enum Code {
  // Server error codes
  ErrUnknown = "E001",
  ErrNotFound = "E002",
  ErrNotAvailable = "E003",
  ErrUnauthorized = "E004",
  ErrInvalidToken = "E005",
  //   ErrInvalidFormat = "E006",
  ErrInvalidHeader = "E007",
  //   ErrWrongCredentials = "E008",
  ErrRegexNotMatch = "E009",
  ErrAlreadyExists = "E010",

  // Local error codes
  ErrFetchingProfile = "FETCHING_PROFILE",
}

interface Warning {
  code: Code;
  title: string;
  text: string;
  level: string;
}

const warnings: { [key: string]: Warning } = {
  [Code.ErrUnknown]: {
    code: Code.ErrUnknown,
    title: i18n.ErrUnknownTitle,
    text: i18n.ErrUnknownText,
    level: "error",
  },
  [Code.ErrNotFound]: {
    code: Code.ErrNotFound,
    title: i18n.ErrForbiddenTitle,
    text: i18n.ErrForbiddenText,
    level: "error",
  },
  [Code.ErrNotAvailable]: {
    code: Code.ErrNotAvailable,
    title: i18n.ErrNotAvailableTitle,
    text: i18n.ErrNotAvailableText,
    level: "info",
  },
  [Code.ErrUnauthorized]: {
    code: Code.ErrUnauthorized,
    title: i18n.ErrUnauthorizedTitle,
    text: i18n.ErrUnauthorizedText,
    level: "info",
  },
  [Code.ErrInvalidToken]: {
    code: Code.ErrInvalidToken,
    title: i18n.ErrForbiddenTitle,
    text: i18n.ErrForbiddenText,
    level: "error",
  },
  //   [Code.ErrInvalidFormat]: {
  //     code: Code.ErrInvalidFormat,
  //     title: i18n.ErrInvalidFormatTitle,
  //     text: i18n.ErrInvalidFormatText,
  //     level: "error",
  //   },
  [Code.ErrInvalidHeader]: {
    code: Code.ErrInvalidHeader,
    title: i18n.ErrForbiddenTitle,
    text: i18n.ErrForbiddenText,
    level: "error",
  },
  //   [Code.ErrWrongCredentials]: {
  //     code: Code.ErrWrongCredentials,
  //     title: i18n.ErrWrongCredentialsTitle,
  //     text: i18n.ErrWrongCredentialsText,
  //     level: "error",
  //   },
  [Code.ErrRegexNotMatch]: {
    code: Code.ErrRegexNotMatch,
    title: i18n.ErrInvalidFormatTitle,
    text: i18n.ErrInvalidFormatText,
    level: "error",
  },
  [Code.ErrFetchingProfile]: {
    code: Code.ErrFetchingProfile,
    title: i18n.ErrFetchingProfileTitle,
    text: i18n.ErrFetchingProfileText,
    level: "error",
  },
};

const getWarning = (code: string): Warning => {
  return warnings[code] ?? warnings[Code.ErrUnknown];
};

export { Code, Warning, getWarning };
