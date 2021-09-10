import React, { useState, useEffect } from "react";
import { render } from "react-dom";

// External libs
import hmacSHA256 from "crypto-js/hmac-sha512";
import Base64 from "crypto-js/enc-base64";

// Translations
import "../../translations/i18n";
import { useTranslation } from "react-i18next";

// Styles
import "../../assets/scss/main.scss";
import "./index.scss";

// Components
import Avatar from "./components/Avatar";

// Modules
import fixSecondaryMonitorBug from "./modules/fix";

fixSecondaryMonitorBug();

const Popup = () => {
  const [state, setState] = useState({
    formInputs: {
      email: "",
      passphrase: "",
    },
    currentUrl: "",
    password: "",
    action: "",
    dark: false,
    knownEmailsOnCurrentUrl: [],
  });

  const [t, i18n] = useTranslation();

  useEffect(() => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      // Get current url
      if (tabs[0]) {
        let currentUrl = tabs[0].url.split("/")[2];

        // Get user data and update state
        chrome.storage.sync.get(
          ["websites", "dark", "lastEmail"],
          function (result) {
            let knownEmailsOnCurrentUrl = state.knownEmailsOnCurrentUrl;
            if (result.websites && result.websites[currentUrl]) {
              knownEmailsOnCurrentUrl = result.websites[currentUrl];
            }

            let lastEmail = state.formInputs.email;
            if (result.lastEmail) {
              lastEmail = result.lastEmail;
            }

            setState({
              ...state,
              currentUrl,
              dark: result.dark || false,
              knownEmailsOnCurrentUrl,
              formInputs: {
                ...state.formInputs,
                email: lastEmail,
              },
            });
          }
        );
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
    saveLastEmail();
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

  const saveLastEmail = () => {
    const lastEmail = state.formInputs.email;
    chrome.storage.sync.set({ lastEmail }, function () {});
  };

  const handleCopyToClipboard = () => {
    const password = document.querySelector(".c-input-password input");
    password.select();
    document.execCommand("copy");

    setState({ ...state, action: "copy" });

    setTimeout(function () {
      setState({ ...state, action: "" });
    }, 4500);

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

      if (
        !oldWebsites ||
        (oldWebsites && oldWebsites[currentUrl] !== newWebsites[currentUrl])
      ) {
        chrome.storage.sync.set({ websites: newWebsites }, function () {
          setState({
            ...state,
            knownEmailsOnCurrentUrl: newWebsites[currentUrl],
            action: "save",
          });

          setTimeout(function () {
            setState({
              ...state,
              knownEmailsOnCurrentUrl: newWebsites[currentUrl],
              action: "",
            });
          }, 4500);

          chrome.action.setBadgeText({
            text: newWebsites[currentUrl].length.toString(),
          });
        });
      } else {
        setState({
          ...state,
          action: "alreadySaved",
        });

        setTimeout(function () {
          setState({
            ...state,
            action: "",
          });
        }, 4500);
      }
    });
  };

  const handleSelectEmail = (email) => {
    setState({ ...state, formInputs: { ...state.formInputs, email } });
  };

  const handleClearEmailInput = () => {
    chrome.storage.sync.set({ lastEmail: "" }, function () {
      setState({
        ...state,
        formInputs: {
          ...state.formInputs,
          email: "",
        },
      });
    });
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

        chrome.action.setBadgeText({
          text: newEmails.length > 0 ? newEmails.length.toString() : "",
        });
      });
    });
  };

  const handleSkipCurrentActionMessage = () => {
    setState({
      ...state,
      action: "",
    });
  };

  const handleJustinSaysHi = () => {
    setState({
      ...state,
      action: "hi",
    });

    setTimeout(function () {
      setState({
        ...state,
        action: "",
      });
    }, 4500);
  };

  const handleChangeLanguageTo = (lang) => {
    i18n.changeLanguage(lang);
  };

  const generateJustinMessage = () => {
    if (state.action === "copy") {
      return `<span class='is-green'>${t(
        "Password copied ! You can paste it wherever you want now !"
      )}</span>`;
    } else if (state.action === "save") {
      return `<span class='is-green'>${t(
        "Got it ! Don't worry, I'll only remember the email and the site name !"
      )}</span>`;
    } else if (state.action === "alreadySaved") {
      return `<span class='is-red'> ${t(
        "I already saved this email for this site !"
      )} </span>`;
    } else if (state.action === "hi") {
      return t(
        "Hi, I'm Justin ! I can help you manage your passwords if you want !"
      );
    }

    if (state.knownEmailsOnCurrentUrl.length === 0) {
      return t("Do you want to generate a new password for this site ?");
    } else if (state.knownEmailsOnCurrentUrl.length === 1) {
      return t("I have 1 email saved for this site !");
    } else {
      return t("I have {{X}} emails saved for this site !", {
        X: state.knownEmailsOnCurrentUrl.length,
      });
    }
  };

  return (
    <div className={`c-popup ${state.dark ? "dark" : "light"}`}>
      <header className="c-popup__header">
        <div className="c-popup__top">{state.currentUrl}</div>
        <div className="c-popup__avatar">
          <Avatar
            message={generateJustinMessage()}
            emails={state.knownEmailsOnCurrentUrl}
            handleSelectEmail={handleSelectEmail}
            handleRemoveEmail={handleRemoveEmail}
            handleSkipCurrentActionMessage={handleSkipCurrentActionMessage}
            handleJustinSaysHi={handleJustinSaysHi}
            action={state.action}
          />
        </div>
        <div className="c-popup__switch-mode">
          <label className="c-switch-mode">
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

      <main className="c-popup__main">
        <form className="c-form" onSubmit={handleFormSubmit}>
          <div className="c-form-group">
            <label htmlFor="email">Email</label>
            <div className="c-form-group__input-container c-form-group__input-container--email">
              <input
                required
                id="email "
                type="email"
                onChange={handleInputChange("email")}
                value={state.formInputs.email}
              />
              {state.formInputs.email.length > 0 && (
                <button type="button" onClick={handleClearEmailInput}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
          <div className="c-form-group">
            <label htmlFor="password">Secret</label>
            <div className="c-form-group__input-container">
              <input
                required
                id="password"
                type="password"
                onChange={handleInputChange("passphrase")}
                value={state.formInputs.passphrase}
              />
            </div>
          </div>
          <button type="submit" className="c-form__button btn btn-primary">
            Let's Go !
          </button>
        </form>

        {state.password && (
          <div className="c-popup__bottom">
            <div className="c-input-password">
              <input
                type="text"
                className={state.action === "copy" ? "password-copied" : ""}
                value={state.password}
                readOnly
              />
              <button onClick={handleCopyToClipboard}>
                {state.action === "copy" ? (
                  <i className="fas fa-check is-green"></i>
                ) : (
                  <i className="fas fa-clipboard"></i>
                )}
              </button>
            </div>
            <div className="c-actions">
              <button className="btn btn-success" onClick={handleSaveData}>
                <i className="fas fa-save"></i> {t("Save")}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="c-popup__footer">
        <div className="c-switch-lang">
          <button
            onClick={() => handleChangeLanguageTo("fr")}
            className={i18n.language.startsWith("fr") ? "active" : ""}
          >
            FR
          </button>
          |
          <button
            onClick={() => handleChangeLanguageTo("en")}
            className={i18n.language.startsWith("en") ? "active" : ""}
          >
            EN
          </button>
        </div>
        <div className="c-copyright">
          <a href="https://www.nicolas-schiltz.fr" target="_blank">
            © Nicolas Schiltz
          </a>
        </div>
      </footer>
    </div>
  );
};

render(<Popup />, window.document.querySelector("#app"));

if (module.hot) module.hot.accept();
