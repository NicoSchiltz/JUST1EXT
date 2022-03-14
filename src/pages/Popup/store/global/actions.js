export const globalActionType = {
  SET_CURRENT_URL: "SET_CURRENT_URL",
  SET_KNOWN_EMAILS_ON_CURRENT_URL: "SET_KNOWN_EMAILS_ON_CURRENT_URL",
  SET_ACTION: "SET_ACTION",
  SET_DARK_MODE: "SET_DARK_MODE",
};

export const setCurrentUrl = (url) => {
  return {
    type: globalActionType.SET_CURRENT_URL,
    payload: url,
  };
};

export const setKnownEmailsOnCurentUrl = (emails) => {
  return {
    type: globalActionType.SET_KNOWN_EMAILS_ON_CURRENT_URL,
    payload: emails,
  };
};

export const setAction = (action) => {
  return {
    type: globalActionType.SET_ACTION,
    payload: action,
  };
};

export const setDarkMode = (boolean) => {
  return {
    type: globalActionType.SET_DARK_MODE,
    payload: boolean,
  };
};
