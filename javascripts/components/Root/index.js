import React, { Component } from "react";
import { OAuth } from "oauthio-web";
import Github from "github";
import Form from "components/Form";
import Login from "components/Login";

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
    return <div>
      { this.state.github ? <Form github={this.state.github} /> : <Login login={this.login.bind(this)} /> }
    </div>;
  }
}

export default Root;
