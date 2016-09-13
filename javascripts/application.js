import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import styles from "index";
import logo from "logo.png";
import { OAuth } from "oauthio-web";

import Root from "components/Root";

const oauthKey  = 'M-bBVCTcOy9vIq7TRkJoL17N6LQ'
const component = (<Root />);

OAuth.initialize(oauthKey);

ReactDOM.render(component, document.getElementById("react-root"));
