import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

// Actions
import {
  setFormEmail,
  setFormPassword,
  setGeneratedPassword,
} from "../../store/generator/actions";

import {
  setAction,
  setKnownEmailsOnCurentUrl,
} from "../../store/global/actions";

// External libs
import Base64 from "crypto-js/enc-base64";
import hmacSHA256 from "crypto-js/hmac-sha512";

// Translations
import "../../../../translations/i18n";

// Styles
import "./index.scss";

const PasswordGenerator = () => {
  const dispatch = useDispatch();
  const [t, i18n] = useTranslation();

  const { currentUrl, action } = useSelector((state) => state.global);
  const { form, generatedPassword } = useSelector((state) => state.generator);

  const handleInputChange = (inputName) => (event) => {
    if (inputName === "email") {
      dispatch(setFormEmail(event.target.value));
    }

    if (inputName === "password") {
      dispatch(setFormPassword(event.target.value));
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    generatePassword();
    saveLastEmail();
  };

  const generatePassword = () => {
    // Generate password
    let password = Base64.stringify(
      hmacSHA256(currentUrl + form.email, form.password)
    ).substring(0, 12);

    // Check for special characters
    const format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (!format.test(password)) {
      password += "@";
    }

    dispatch(setGeneratedPassword(password));
  };

  const saveLastEmail = () => {
    const lastEmail = form.email;
    chrome.storage.sync.set({ lastEmail }, function () {});
  };

  const handleCopyToClipboard = () => {
    const password = document.querySelector(".c-input-password input");
    password.select();
    document.execCommand("copy");

    dispatch(setAction("copy"));

    setTimeout(function () {
      dispatch(setAction(""));
    }, 4500);

    let sel = document.getSelection();
    sel.removeAllRanges();
  };

  const handleSaveData = () => {
    const email = form.email;

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
          dispatch(setAction("save"));
          dispatch(setKnownEmailsOnCurentUrl(newWebsites[currentUrl]));

          setTimeout(function () {
            dispatch(setAction(""));
          }, 4500);

          chrome.action.setBadgeText({
            text: newWebsites[currentUrl].length.toString(),
          });
        });
      } else {
        dispatch(setAction("alreadySaved"));

        setTimeout(function () {
          dispatch(setAction(""));
        }, 4500);
      }
    });
  };

  const handleClearEmailInput = () => {
    chrome.storage.sync.set({ lastEmail: "" }, function () {
      dispatch(setFormEmail(""));
    });
  };

  return (
    <div className="c-password-generator">
      <form className="c-form" onSubmit={handleFormSubmit}>
        <div className="c-form-group">
          <label htmlFor="email">Email</label>
          <div className="c-form-group__input-container c-form-group__input-container--email">
            <input
              required
              id="email"
              type="email"
              onChange={handleInputChange("email")}
              value={form.email}
            />
            {form.email && form.email.length > 0 && (
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
              onChange={handleInputChange("password")}
              value={form.password}
            />
          </div>
        </div>
        <button type="submit" className="c-form__button btn btn-primary">
          Let's Go !
        </button>
      </form>

      {generatedPassword && (
        <div className="c-popup__bottom">
          <div className="c-input-password">
            <input
              type="text"
              className={action === "copy" ? "password-copied" : ""}
              value={generatedPassword}
              readOnly
            />
            <button onClick={handleCopyToClipboard}>
              {action === "copy" ? (
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
    </div>
  );
};

export default PasswordGenerator;
