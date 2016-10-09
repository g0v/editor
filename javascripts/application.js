import React from "react";
import { Router, Route, Link, browserHistory } from 'react-router';
import ReactDOM from "react-dom";
import styles from "index";
import logo from "logo.png";
import { OAuth } from "oauthio-web";

import Root from "components/Root";
import Search from "components/Search";

const oauthKey  = 'M-bBVCTcOy9vIq7TRkJoL17N6LQ'
const component = (
  <Router history={browserHistory}>
    <Route path="*"      component={Root} />
    <Route path="editor" component={Root} />
    <Route path="search" component={Search} />
  </Router>
);

OAuth.initialize(oauthKey);

ReactDOM.render(component, document.getElementById("react-root"));
