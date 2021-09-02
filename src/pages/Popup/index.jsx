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
    passwordCopied: "",
    dark: false,
    knownEmailsOnCurrentUrl: [],
  });

  useEffect(() => {
    // Get current url
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs[0]) {
        let currentUrl = tabs[0].url;

        // Hack to only get the host property of the URL
        const urlHack = document.createElement("a");
        urlHack.href = currentUrl;
        currentUrl = urlHack.host;

        // Get user data and update state
        chrome.storage.sync.get(["websites", "dark"], function (result) {
          let knownEmailsOnCurrentUrl = state.knownEmailsOnCurrentUrl;

          if (result.websites && result.websites[currentUrl]) {
            knownEmailsOnCurrentUrl = result.websites[currentUrl];
          }

          setState({
            ...state,
            currentUrl,
            dark: result.dark || false,
            knownEmailsOnCurrentUrl,
          });
        });
      }
    });
  }, []);

  const handleSwitch = () => {
    chrome.storage.sync.set({ dark: !state.dark }, function () {
      setState({ ...state, dark: !state.dark });
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

  const handleCopyToClipboard = () => {
    const password = document.querySelector(".popup__password input");
    password.select();
    document.execCommand("copy");

    setState({ ...state, passwordCopied: true });
    setTimeout(function () {
      setState({ ...state, passwordCopied: false });
    }, 3000);

    let sel = document.getSelection();
    sel.removeAllRanges();
  };

  const handleSaveData = () => {
    const currentUrl = state.currentUrl;
    const email = state.formInputs.email;

    chrome.storage.sync.get(["websites"], function (result) {
      const oldWebsites = result.websites;
      const newWebsites = { ...oldWebsites };

      if (oldWebsites && oldWebsites[currentUrl]) {
        const oldEmails = oldWebsites[currentUrl];

        if (
          !oldWebsites[currentUrl].find(
            (websiteEmail) => websiteEmail === email
          )
        ) {
          newWebsites[currentUrl] = [...oldEmails, email];
        }
      } else {
        newWebsites[currentUrl] = [email];
      }

      chrome.storage.sync.set({ websites: newWebsites }, function () {
        chrome.storage.sync.set({ websites: newWebsites }, function () {
          setState({
            ...state,
            knownEmailsOnCurrentUrl: newWebsites[currentUrl],
          });
        });
      });
    });
  };

  const handleSelectEmail = (email) => {
    setState({ ...state, formInputs: { ...state.formInputs, email } });
  };

  const handleRemoveEmail = (email) => {
    chrome.storage.sync.get(["websites"], function (result) {
      const currentUrl = state.currentUrl;
      const oldWebsites = result.websites;
      const newWebsites = { ...oldWebsites };

      const newEmails = oldWebsites[currentUrl].filter(
        (websiteEmail) => websiteEmail !== email
      );

      newWebsites[currentUrl] = newEmails;

      chrome.storage.sync.set({ websites: newWebsites }, function () {
        setState({
          ...state,
          knownEmailsOnCurrentUrl: newEmails,
        });
      });
    });
  };

  const generateJustinMessage = () => {
    if (state.knownEmailsOnCurrentUrl.length === 0) {
      return "Tu veux générer un nouveau mot de passe pour ce site ?";
    } else if (state.knownEmailsOnCurrentUrl.length === 1) {
      return `J'ai 1 email enregistré pour ce site !`;
    } else {
      return `J'ai ${state.knownEmailsOnCurrentUrl.length} emails enregistrés pour ce site !`;
    }
  };

  return (
    <div className={`popup ${state.dark ? "dark" : "light"}`}>
      <header className="popup__header">
        <div className="popup__top">{state.currentUrl}</div>
        <div className="popup__avatar">
          <Avatar
            message={generateJustinMessage()}
            emails={state.knownEmailsOnCurrentUrl}
            handleSelectEmail={handleSelectEmail}
            handleRemoveEmail={handleRemoveEmail}
          />
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
      </header>

      <main className="popup__main">
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
                value={state.formInputs.email}
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
                value={state.formInputs.passphrase}
              />
            </div>
          </div>
          <button className="form__button btn btn-primary">Let's Go !</button>
        </form>

        {state.password && (
          <div className="popup__bottom">
            <div className="popup__password">
              <input
                type="text"
                className={state.passwordCopied ? "password-copied" : ""}
                value={state.password}
                readOnly
              />
              <button onClick={handleCopyToClipboard}>
                {state.passwordCopied ? (
                  <i className="fas fa-check is-green"></i>
                ) : (
                  <i className="fas fa-clipboard"></i>
                )}
              </button>
            </div>
            <div className="popup__actions">
              <button className="btn btn-success" onClick={handleSaveData}>
                <i className="fas fa-save"></i> Enregistrer
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="popup__footer">
        <a href="https://www.nicolas-schiltz.fr" target="_blank">
          © Nicolas Schiltz
        </a>
      </footer>
    </div>
  );
};

render(<Popup />, window.document.querySelector("#app"));

if (module.hot) module.hot.accept();
