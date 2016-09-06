import Vue from "vue";
import $ from "jquery";
import { OAuth } from "oauthio-web";
import styles from "index";
import logo from "logo.png";
import { getParameterByName } from "params";
import Github from "github";
import Prefiller from "prefiller";

const oauthKey = 'M-bBVCTcOy9vIq7TRkJoL17N6LQ'

function complete(pull) {
  console.log(`Created pull request ${pull.url}`);
  app.submitting = false
}

var app = new Vue({
    el: '#app',
    data: {
        schema: {},
        logged_in: false,
        github: undefined,
        prefiller: undefined,
        submitting: false,
        target_json_exists: false
    },
    created() {
        $.ajax("https://raw.githubusercontent.com/g0v/g0v.json/master/schemas/v1.json", {
          success: (data) => {
            app.prefiller = new Prefiller(this.schema = JSON.parse(data).properties);
            var params = app.prefiller.params();

            if (params["repo"] && params["repo"] !== "") {
              $.ajax(`https://raw.githubusercontent.com/${params["repo"]}/master/g0v.json`, {
                success: (existed) => {
                  this.target_json_exists = true
                  this.fillup(Object.assign(app.prefiller.existed(JSON.parse(existed)), params));
                },
                error: (xhr) => {
                  console.log("failed to load target repo g0v.json")
                  this.fillup(params);
                }
             })
            }
          },
          error: (xhr) => {
            console.log("fail to load schema");
          },
        });
    },
    methods: {
        fillup(json) {
          Object.keys(json).forEach((name) => {
            Vue.set(this.schema, name, Object.assign({ prefill: json[name] }, this.schema[name]))
          });
        },

        login() {
          OAuth.initialize(oauthKey)
          OAuth.popup('github').done(function(connection) {
            app.github = new Github(connection);
            connection.get('/user').done(function(user) { app.github.owner = user.login; app.logged_in = true; })
          })
          .fail(function (err) {
            console.error(err)
          })
        },

        submit() {
            app.submitting = true
            var result = {}
            $.each(this.schema, (name, i) => {
                var val = $(`input[name=${name}`).val()
                if (val !== "") {
                    if (i.type == "array") {
                        val = val.split(',')
                    }
                    result[name] = val

                    if (name === "repo") {
                      app.schema.repo.prefill = val
                    }
                }
            })
            this.commit("g0v.json", JSON.stringify(result, null, "  "))
        },

        commit(filename, content) {
          new Promise(function(resolve, reject) {
            app.github.filename = filename;
            [app.github.author, app.github.repo] = app.schema.repo.prefill.split("/")
            app.github.createFork().done(resolve);
          })
          .then(function(fork) { return app.github.createBlob(content) })
          .then(function(blob) { app.github.blob = blob; return "master" })
          .then(app.github.getReference.bind(app.github))
          .then(app.github.getCommit.bind(app.github))
          .then(function (commit) { return app.github.commit = commit; })
          .then(app.github.getTree.bind(app.github))
          .then(app.github.createTree.bind(app.github))
          .then(app.github.createCommit.bind(app.github))
          .then(app.github.createReference.bind(app.github))
          .then(app.github.createPullRequest.bind(app.github))
          .then(complete);
        }
    }
})
