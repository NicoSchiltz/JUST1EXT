import React from "react";
import { render } from "react-dom";

// Redux
import { Provider } from "react-redux";
import store from "./store";

// Styles
import "../../assets/scss/main.scss";
import "./index.scss";

// Components
import Popup from "./components/Popup";

// Styles
import "../../assets/scss/main.scss";

// Modules
import fixSecondaryMonitorBug from "./modules/fix";

fixSecondaryMonitorBug();

const App = () => {
  return (
    <Provider store={store}>
      <Popup />
    </Provider>
  );
};

render(<App />, window.document.querySelector("#app"));

if (module.hot) module.hot.accept();
