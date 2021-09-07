import React, { useState, useEffect } from "react";
import { render } from "react-dom";

import hmacSHA256 from "crypto-js/hmac-sha512";
import Base64 from "crypto-js/enc-base64";

import "./index.scss";

import Avatar from "./components/Avatar";

/**
 * Temporary workaround for secondary monitors on MacOS where redraws don't happen
 * @See https://bugs.chromium.org/p/chromium/issues/detail?id=971701
 */
if (
  // From testing the following conditions seem to indicate that the popup was opened on a secondary monitor
  window.screenLeft < 0 ||
  window.screenTop < 0 ||
  window.screenLeft > window.screen.width ||
  window.screenTop > window.screen.height
) {
  chrome.runtime.getPlatformInfo(function (info) {
    if (info.os === "mac") {
      const fontFaceSheet = new CSSStyleSheet();
      fontFaceSheet.insertRule(`
        @keyframes redraw {
          0% {
            opacity: 1;
          }
          100% {
            opacity: .99;
          }
        }
      `);
      fontFaceSheet.insertRule(`
        html {
          animation: redraw 1s linear infinite;
        }
      `);
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        fontFaceSheet,
      ];
    }
  });
}

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
    lang: "FR",
  });

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
    const password = document.querySelector(".popup__password input");
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

  const handleClearEmail = () => {
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

  const handleSkipCurrentAction = () => {
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

  const generateJustinMessage = () => {
    if (state.action === "copy") {
      return "<span class='is-green'>Ton mot de passe est copié, tu peux le coller où tu veux maintenant !</span>";
    } else if (state.action === "save") {
      return "<span class='is-green'>C'est noté ! Ne t'inquiète pas, je ne retiens que l'email et le nom du site !</span>";
    } else if (state.action === "alreadySaved") {
      return "<span class='is-red'>J'ai déjà enregistré cet email pour ce site !</span>";
    } else if (state.action === "hi") {
      return "Salut, moi c'est Justin ! Je peux t'aider à gérer tes mots de passe si tu veux !";
    }

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
            handleSkipCurrentAction={handleSkipCurrentAction}
            handleJustinSaysHi={handleJustinSaysHi}
            action={state.action}
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
            <div className="form__email form__input-container">
              <input
                required
                className="form__input"
                id="email "
                type="email"
                onChange={handleInputChange("email")}
                value={state.formInputs.email}
              />
              {state.formInputs.email.length > 0 && (
                <button
                  className="form__email-delete-btn"
                  type="button"
                  onClick={handleClearEmail}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
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
            <div className="popup__actions">
              <button className="btn btn-success" onClick={handleSaveData}>
                <i className="fas fa-save"></i> Enregistrer
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="popup__footer">
{/*         <div className="popup__switch-lang">
          <button className={state.lang === "FR" ? "active" : ""}>FR</button>|
          <button className={state.lang === "EN" ? "active" : ""}>EN</button>
        </div> */}
        <a href="https://www.nicolas-schiltz.fr" target="_blank">
          © Nicolas Schiltz
        </a>
      </footer>
    </div>
  );
};

render(<Popup />, window.document.querySelector("#app"));

if (module.hot) module.hot.accept();
