import React, { useState, useEffect } from "react";
import { render } from "react-dom";

import hmacSHA256 from "crypto-js/hmac-sha512";
import Base64 from "crypto-js/enc-base64";

import "./index.scss";

import Avatar from "./components/Avatar";

const Popup = () => {
  const [state, setState] = useState({
    formInputs: {
      email: "",
      passphrase: "",
    },
    currentUrl: "",
    password: "",
    dark: false,
  });

  useEffect(() => {
    // Get user data (dark mode)
    chrome.storage.sync.get(["dark"], function (result) {
      setState({ ...state, dark: result.dark });
    });

    // Get current url
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs[0]) {
        let currentUrl = tabs[0].url;

        // Hack to only get the host property of the URL
        const urlHack = document.createElement("a");
        urlHack.href = currentUrl;
        currentUrl = urlHack.host;

        setState({ ...state, currentUrl });
      }
    });
  }, []);

  const handleSwitch = () => {
    chrome.storage.sync.set({ dark: !state.dark }, function () {
      setState({ ...state, dark: !state.dark });
      chrome.storage.sync.get(["dark"], function (result) {
        console.log(result);
      });
    });
  };

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

  const handleCopyToClipboard = () => {
    const password = document.querySelector(".popup__password");
    password.select();
    document.execCommand("copy");
  };

  const generatePassword = () => {
    // Generate password
    let password = Base64.stringify(
      hmacSHA256(
        state.currentUrl + state.formInputs.email,
        state.formInputs.passphrase
      )
    ).substring(0, 12);

    // Check for special characters
    const format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (!format.test(password)) {
      password += "@";
    }

    setState({ ...state, password });
  };

  return (
    <div className={`popup ${state.dark ? "dark" : "light"}`}>
      <div className="popup__header">
        {state.currentUrl}
        <div className="popup__avatar">
          <Avatar />
        </div>
        <div className="popup__switch-mode">
          <label>
            <input
              type="checkbox"
              checked={state.dark}
              onChange={handleSwitch}
            />
            {(!state.dark && <i className="fas fa-moon"></i>) || (
              <i className="fas fa-sun"></i>
            )}
          </label>
        </div>
      </div>

      <div className="popup__main">
        <form className="form" onSubmit={handleFormSubmit}>
          <div className="form__group">
            <label htmlFor="email">Email</label>
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
            <label htmlFor="password">Secret</label>
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
          <button className="form__button btn btn-primary">
            Generate Password
          </button>
        </form>

        {state.password && (
          <div className="popup__bottom">
            <input
              type="text"
              className="popup__password"
              value={state.password}
              readOnly
            />
            <div className="popup__buttons">
              <button
                className="btn btn-primary"
                onClick={handleCopyToClipboard}
              >
                <i className="fas fa-clipboard"></i>
              </button>
{/*               <button className="btn btn-primary">
                <i className="fas fa-save"></i>
              </button> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

render(<Popup />, window.document.querySelector("#app"));

if (module.hot) module.hot.accept();
