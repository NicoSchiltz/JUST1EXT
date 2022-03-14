import { globalActionType } from "./actions";

const globalInitialState = {
  currentUrl: "",
  knownEmailsOnCurrentUrl: [],
  action: "",
  dark: false,
};

export default function reducer(state = globalInitialState, action) {
  switch (action.type) {
    case globalActionType.SET_CURRENT_URL:
      return { ...state, currentUrl: action.payload };
    case globalActionType.SET_KNOWN_EMAILS_ON_CURRENT_URL:
      return { ...state, knownEmailsOnCurrentUrl: action.payload };
    case globalActionType.SET_ACTION:
      return { ...state, action: action.payload };
    case globalActionType.SET_DARK_MODE:
      return { ...state, dark: action.payload };
    default:
      return state;
  }
}
