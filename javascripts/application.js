import Vue from "vue";
import $ from "jquery";
import { OAuth } from "oauthio-web";
import styles from "index";
import logo from "logo.png";

const oauthKey = 'M-bBVCTcOy9vIq7TRkJoL17N6LQ'

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const app = new Vue({
  el: "#app",
  data: {
    message: "hello",
    schema: {},
    result: "",
    logged_in: false,
    username: "",
    conn: null,
    user: null,
    submitting: false,
  },
  created: function() {
    $.ajax("https://raw.githubusercontent.com/g0v/g0v.json/master/schemas/v1.json", {
      success: (data) => {
        var schema = this.schema = JSON.parse(data).properties;

        $.each(schema, function(name, i) {
          var prefill = getParameterByName(name)

          if (prefill !== "") {
              schema[name].prefill = prefill
          }
        })
      },
      fail: (xhr) => {
        console.log("fail to load schema");
      },
    });
  },
  methods: {
    login: function() {
      OAuth.initialize(oauthKey);
      OAuth.popup("github").done(function(result) {
        app.conn = result;
        result.get('/user')
        .done(function(resp) {
          app.username = resp.name
          app.logged_in = true
          app.user = resp
        })
        .fail(function(error) {
          console.log(error);
        });
      });
    },

    submit: function() {
      app.submitting = true
      var result = {}
      $.each(this.schema, (name, i) => {
          var val = $(`input[name=${name}`).val()
          if (val !== "") {
              if (i.type == "array") {
                  val = val.split(',')
              }
              result[name] = val
          }
      })
      app.result = JSON.stringify(result)
      this.commit("g0v.json", app.result)
    },

    commit: function(filename, content) {
      var x = app.user
      var currentHEADCommit
      var newBlob
      var branch
      var fork
      new Promise(function(out_resolve, reject) {
          app.conn.post(`/repos/${app.schema.repo.prefill}/forks`)
          .done(function (user_fork) {
          fork = user_fork
          })
          // wait until fork complete
          setTimeout(function() {
              out_resolve(0)
          }, 3000)
      })
      .then(function() {
          return app.conn.get(`/repos/${x.login}/${fork.name}/git/refs/heads/master`)
      })
      .then(function (currentHEAD) {
          return app.conn.get(currentHEAD.object.url)
      })
      .then(function (HEADCommit) {
          currentHEADCommit = HEADCommit
          return app.conn.post(`/repos/${x.login}/${fork.name}/git/blobs`, {data: JSON.stringify({content: content, encoding: "utf-8"})})
      })
      .then(function (blob) {
          newBlob = blob
          return app.conn.get(currentHEADCommit.tree.url)
      })
      .then(function (currentHEADtree) {
          return app.conn.post(`/repos/${x.login}/${fork.name}/git/trees`, {
            data: JSON.stringify({
                    base_tree: currentHEADtree.sha,
                    tree: [
                      {
                        path: filename,
                        mode: "100644",
                        type: "blob",
                        sha: newBlob.sha
                      }
                    ]
            })
          })
      })
      .then(function (newTree) {
          return app.conn.post(`/repos/${x.login}/${fork.name}/git/commits`, { data: JSON.stringify({
              message: `update ${filename}`,
              tree: newTree.sha,
              parents: [currentHEADCommit.sha]})})
      })
      .then(function (newCommit) {
          branch = `update-${filename}-${Date.now()}`
          return app.conn.post(`/repos/${x.login}/${fork.name}/git/refs`, { data: JSON.stringify({sha: newCommit.sha, ref: `refs/heads/${branch}`})})
      })
      .then(function (newRef) {
          return app.conn.post(`/repos/${app.schema.repo.prefill}/pulls`, { data: JSON.stringify({
              title: `update ${filename}`,
              body: "this is a pull request from metadata-editor",
              head: `${x.login}:${branch}`,
              base: `master`
          })})
      }).then(function () {
          alert('PR 建立完成')
          app.submitting = false
      })
    }
  },
});
