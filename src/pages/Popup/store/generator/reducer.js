import { generatorActionType } from "./actions";

const generatorInitialState = {
  form: { email: "", password: "" },
  generatedPassword: "",
};

export default function reducer(state = generatorInitialState, action) {
  switch (action.type) {
    case generatorActionType.SET_GENERATED_PASSWORD:
      return { ...state, generatedPassword: action.payload };
    case generatorActionType.SET_FORM_EMAIL:
      return { ...state, form: { ...state.form, email: action.payload } };
    case generatorActionType.SET_FORM_PASSWORD:
      return { ...state, form: { ...state.form, password: action.payload } };
    default:
      return state;
  }
}
