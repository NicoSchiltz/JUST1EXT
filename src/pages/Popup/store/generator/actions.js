export const generatorActionType = {
  SET_GENERATED_PASSWORD: "SET_GENERATED_PASSWORD",
  SET_FORM_EMAIL: "SET_FORM_EMAIL",
  SET_FORM_PASSWORD: "SET_FORM_PASSWORD",
};

export const setGeneratedPassword = (url) => {
  return {
    type: generatorActionType.SET_GENERATED_PASSWORD,
    payload: url,
  };
};

export const setFormEmail = (value) => {
  return {
    type: generatorActionType.SET_FORM_EMAIL,
    payload: value,
  };
};

export const setFormPassword = (value) => {
  return {
    type: generatorActionType.SET_FORM_PASSWORD,
    payload: value,
  };
};
