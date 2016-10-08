import React, { Component } from "react";
import { Router, Route, Link, browserHistory } from 'react-router';
import { OAuth } from "oauthio-web";
import Github from "github";
import Form from "components/Form";
import Login from "components/Login";
import Search from "components/Search";

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      github: null,
    };
  }

  login(e) {
    OAuth.popup('github')
    .done((connection) => {
      connection.get("/user").done((user) => {
        this.setState({ github: new Github(connection, user.login) });
      });
    })
    .fail((err) => {
      console.error(err)
    })
  }

  render() {
    return <Router history={browserHistory}>
      <Route path="*"       component={Login} />
      <Route path="editor"  component={Login}>
        <Route path="search"  component={Search}  />
        <Route path="form"    component={Form}    />
      </Route>
    </Router>;
  }
}

export default Root;
