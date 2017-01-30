import React, { Component } from "react";
import { Link } from "react-router";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return <header>
      <Link to="/search">Search</Link>
      <Link to="/editor">Editor</Link>
    </header>;
  }
}

export default Header;
