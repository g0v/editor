import React, { Component } from "react";
import $ from "jquery";
import { OAuth } from "oauthio-web";
import Github from "github";
import g0vJSON from "g0v.json";
import update from "react-addons-update";
import Prefiller from "prefiller";

const oauthKey  = 'M-bBVCTcOy9vIq7TRkJoL17N6LQ'
const schema    = new g0vJSON("v1").schema().properties;
const prefiller = new Prefiller(schema);
const filename  = "g0v.json";
const params    = prefiller.params();

OAuth.initialize(oauthKey);

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      github: null,
      submitting: false,
      content: params,
    };
  }

  componentDidMount() {
    if (this.state.content.repo && this.state.content.repo !== "") {
      $.ajax(`https://raw.githubusercontent.com/${this.state.content.repo}/master/g0v.json`, {
        success: (existed) => {
          this.set("content", Object.assign(this.state.content, prefiller.existed(JSON.parse(existed))));
        },
        error: (xhr) => {
          console.log("failed to load target repo g0v.json");
        }
      });
    }
  }

  update(keys, action) {
    let key = null;
    while(key = keys.pop()) {
      let tmp  = {};
      tmp[key] = action;
      action   = tmp;
    }
    this.setState(update(this.state, action));
  }

  set(name, value) {
    this.update(name.split(/\./), { $set: value });
  }

  change(e) {
    this.set(e.target.name, e.target.value);
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

  submit(e) {
    this.setState({ submitting: true });

    var that    = this;
    var content = JSON.stringify(this.state.content, null, "  ");
    var github  = this.state.github;
    github.filename = filename;
    [github.author, github.repo] = this.state.content.repo.split("/")

    new Promise(function(resolve, reject) {
      github.createFork().done(resolve);
    })
    .then((fork) => { return github.createBlob(content) })
    .then((blob) => { github.blob = blob; return "master" })
    .then(github.getReference.bind(github))
    .then(github.getCommit.bind(github))
    .then((commit) => { return github.commit = commit })
    .then(github.getTree.bind(github))
    .then(github.createTree.bind(github))
    .then(github.createCommit.bind(github))
    .then(github.createReference.bind(github))
    .then(github.createPullRequest.bind(github))
    .then((pull) => {
      this.setState({ submitting: false });
      console.log("Pull Request created")
    });
  }

  column(pair) {
    var [name, attribute] = pair;
    return <div key={name}>
      <label><span>*</span> { attribute.title }: </label>
      <input type="text" name={`content.${name}`} placeholder={attribute.description} value={this.state.content[name] || ""} onChange={this.change.bind(this)} />
    </div>;
  }

  button() {
    if (this.state.github) {
      if (this.state.submitting) {
        return <div className="submit">
          <button>建立中...</button>
        </div>;
      } else {
        return <div className="submit" onClick={this.submit.bind(this)}>
          <button id="submit-button" type="submit">建立 Pull Request</button>
        </div>;
      }
    } else {
      return <div className="submit" onClick={this.login.bind(this)}>
        <button>用 github 登入以建立 Pull Request</button>
      </div>;
    }
  }

  render() {
    return <div>
      { Object.entries(schema).map(this.column.bind(this)) }
      { this.button() }
    </div>;
  }
}

export default Root;
