import { combineReducers } from "redux";

import global from "./global/reducer";
import generator from "./generator/reducer";

export default combineReducers({ global, generator });
