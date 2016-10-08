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
      <div id="header">
        <img src="logo.png"/>
        <h1>g0v metadata editor</h1>
        <p>
          The form below will help you build a valid g0v.json file.
          Fill out all of the required fields (marked by a star) and any others.
          Next, you can click the buttons at the bottom of the page to render and create a Pull Request to target repository.
        </p>
      </div>

      { this.state.github ? <Form github={this.state.github} /> : <Login login={this.login.bind(this)} /> }
    </div>;
  }
}

export default Root;
