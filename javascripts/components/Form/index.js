import React, { Component } from "react";
import $ from "jquery";
import update from "react-addons-update";
import g0vJSON from "g0v.json";
import Prefiller from "prefiller";

const schema    = new g0vJSON("v1").schema().properties;
const prefiller = new Prefiller(schema);
const params    = prefiller.params();
const filename  = "g0v.json";

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      github: props.github,
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
    try {
      // if value is json object
      var obj = JSON.parse(e.target.value)
      this.set(e.target.name, obj)
    } catch (exception) {
      this.set(e.target.name, e.target.value);
    }
  }

  column(pair) {
    var [name, attribute] = pair;
    var value = this.state.content[name] || ""
    if (name === 'licenses' || name === 'repository') {
      value = normalize(value)
    }
    return <div key={name}>
      <label><span>*</span> { attribute.title }: </label>
      <input type="text" name={`content.${name}`} placeholder={attribute.description} value={value} onChange={this.change.bind(this)} />
    </div>;
  }

  button() {
    if (this.state.submitting) {
      return <div className="submit">
        <button>建立中...</button>
      </div>;
    } else {
      return <div className="submit" onClick={this.submit.bind(this)}>
        <button id="submit-button" type="submit">建立 Pull Request</button>
      </div>;
    }
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

  render() {
    return <div>
      { Object.entries(schema).map(this.column.bind(this)) }
      { this.button() }
    </div>;
  }
}

export default Form;

function normalize (value) {
  if (typeof value === 'object') return JSON.stringify(value)

  return value
}
