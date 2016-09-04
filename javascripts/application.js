import Vue from "vue";
import $ from "jquery";
import { OAuth } from "oauthio-web";
import styles from "index";
import logo from "logo.png";
import { getParameterByName } from "params";
import Github from "./github";

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
        user: undefined,
        submitting: false,
        target_json_exists: false
    },
    created() {
        $.ajax("https://raw.githubusercontent.com/g0v/g0v.json/master/schemas/v1.json", {
          success: (data) => {
              var schema = this.schema = JSON.parse(data).properties;
              var prefill_repo = getParameterByName("repo")
              if (prefill_repo && prefill_repo !== "") {
                  this.repo = prefill_repo
                  $.ajax(`https://raw.githubusercontent.com/${prefill_repo}/master/g0v.json`,
                         {
                             success: (existed) => {
                                 existed = JSON.parse(existed)
                                 console.log(existed)

                                 Object.keys(existed).forEach((k) => {
                                     Object.keys(this.schema).forEach((name, i) => {
                                       //console.log(name, k)
                                         if (name === k) {
                                             Vue.set(this.schema, k, Object.assign({prefill: existed[k]}, this.schema[k]))
                                             this.target_json_exists = true
                                             console.log("prefill from target repo", k, existed[k], this.schema[k].prefill)
                                         }
                                     })
                                 })
                                 this.prefill_from_query()
                             },
                             error: (xhr) => {
                                 console.log("failed to load target repo g0v.json")
                                 this.prefill_from_query()
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
        prefill_from_query() {
            Object.keys(this.schema).forEach((name,i) => {
                var prefill = getParameterByName(name)

                if (prefill !== null) {
                    if (this.schema[name].prefill) {
                        this.schema[name].prefill = prefill
                    } else {
                        Vue.set(this.schema, name, Object.assign({prefill: prefill}, this.schema[name]))
                    }
                    console.log("prefill from query", name, prefill, this.schema[name].prefill)
                }
            })
        },
        login() {
          OAuth.initialize(oauthKey)
          OAuth.popup('github').done(function(connection) {
            app.github = new Github(connection);
            connection.get('/user').done(function(user) { app.user = user; app.logged_in = true; })
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
            app.github.owner = app.user.login;
            app.github.filename = filename;
            [app.github.author, app.github.repo] = app.schema.repo.prefill.split("/")
            app.github.createFork().done(resolve);
          })
          .then(function(fork) { return app.github.createBlob(content) })
          .then(function(blob) { app.github.blob = blob; return "master" })
          .then(app.github.getReference.bind(app.github))
          .then(app.github.getCommit.bind(app.github))
          .then(function (commit) { app.github.commit = commit; return app.github.getTree(commit); })
          .then(app.github.createTree.bind(app.github))
          .then(app.github.createCommit.bind(app.github))
          .then(app.github.createReference.bind(app.github))
          .then(app.github.createPullRequest.bind(app.github))
          .then(complete);
        }
    }
})
