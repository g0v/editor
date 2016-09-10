import React, { Component } from "react";

class Login extends Component {
  render() {
    return <div className="submit" onClick={this.props.login}>
      <button>用 github 登入以建立 Pull Request</button>
    </div>;
  }
}

export default Login;
