import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

// Components
import PasswordGenerator from "../PasswordGenerator";
import Justin from "../Justin";

// Actions
import {
  setCurrentUrl,
  setKnownEmailsOnCurentUrl,
  setDarkMode,
} from "../../store/global/actions";

// Translations
import "../../../../translations/i18n";
import { useTranslation } from "react-i18next";

// Styles
import "./index.scss";

const Popup = () => {
  const dispatch = useDispatch();

  const [t, i18n] = useTranslation();

  const { currentUrl, dark } = useSelector((state) => state.global);

  useEffect(() => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      // Get current url
      if (tabs[0]) {
        // Get user data and update store
        chrome.storage.sync.get(
          ["websites", "dark", "lastEmail"],
          function (result) {
            const currentUrl = tabs[0].url.split("/")[2];
            dispatch(setCurrentUrl(currentUrl));
            if (result.websites && result.websites[currentUrl]) {
              result.websites[currentUrl];
              dispatch(setKnownEmailsOnCurentUrl(result.websites[currentUrl]));
            }

            if (result.dark) {
              dispatch(setDarkMode(result.dark));
            }
          }
        );
      }
    });
  }, []);

  const handleSwitch = () => {
    chrome.storage.sync.set({ dark: !dark }, function () {
      dispatch(setDarkMode(!dark));
    });
  };

  const handleChangeLanguageTo = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className={`c-popup ${dark ? "dark" : "light"}`}>
      <header className="c-popup__header">
        <div className="c-popup__top">{currentUrl}</div>
        <div className="c-popup__avatar">
          <Justin />
        </div>
        <div className="c-popup__switch-mode">
          <label className="c-switch-mode">
            <input type="checkbox" checked={dark} onChange={handleSwitch} />
            {(!dark && <i className="fas fa-moon"></i>) || (
              <i className="fas fa-sun"></i>
            )}
          </label>
        </div>
      </header>

      <main className="c-popup__main">
        <PasswordGenerator />
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

export default Popup;
