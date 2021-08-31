import React, { useState } from "react";
import { render } from "react-dom";

import hmacSHA256 from "crypto-js/hmac-sha512";
import Base64 from "crypto-js/enc-base64";

import "./index.scss";

const Popup = () => {
  const [state, setState] = useState({
    formInputs: {
      email: "",
      passphrase: "",
    },
    currentUrl: "",
    password: "",
    mode: "dark",
  });

  const handleInputChange = (inputName) => (event) => {
    setState({
      ...state,
      formInputs: {
        ...state.formInputs,
        [inputName]: event.target.value,
      },
    });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    generatePassword();
  };

  const generatePassword = () => {
    let currentUrl;

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs[0]) {
        currentUrl = tabs[0].url;

        // Hack to only get the host property of the URL
        const urlHack = document.createElement("a");
        urlHack.href = currentUrl;

        const host = urlHack.host;

        // Generate password
        let password = Base64.stringify(
          hmacSHA256(host + state.formInputs.email, state.formInputs.passphrase)
        ).substring(0, 12);

        // Check for special characters
        const format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        if (!format.test(password)) {
          password += "@";
        }

        setState({ ...state, currentUrl, password });
      }
    });
  };

  return (
    <div className="popup">
      <form className="form" onSubmit={handleFormSubmit}>
        <div className="form__group">
          <label htmlFor="email">E-mail :</label>
          <div className="form__input-container">
            <input
              required
              className="form__input"
              id="email "
              type="email"
              onChange={handleInputChange("email")}
            />
          </div>
        </div>
        <div className="form__group">
          <label htmlFor="password">Secret :</label>
          <div className="form__input-container">
            <input
              required
              className="form__input"
              id="password"
              type="password"
              onChange={handleInputChange("passphrase")}
            />
          </div>
        </div>
        <button className="form__button btn btn-primary" data-hover="test">
          Generate Password
        </button>
      </form>

      {state.password && (
        <div className="popup__password">{state.password}</div>
      )}
    </div>
  );
};

render(<Popup />, window.document.querySelector("#app"));

if (module.hot) module.hot.accept();
