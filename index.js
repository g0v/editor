var app = new Vue({
    el: '#app',
    data: {
        message: "hello",
        schema: schema,
        result: "" ,
        logged_in: false,
        username: "",
        conn: undefined,
        user: undefined
    },
    created() {
        schema.forEach(function(x,i) {
            var prefill = getParameterByName(x.name)

            if (prefill !== "") {
                schema[i].prefill = prefill
            }
        })
    },
    methods: {
        login() {
            OAuth.initialize('M-bBVCTcOy9vIq7TRkJoL17N6LQ')
            OAuth.popup('github').done(function(result) {
                console.log(result)
                app.conn = result
                result.get('/user')
                .done(function(resp) {
                    console.log(resp)
                    app.username = resp.name
                    app.logged_in = true
                    app.user = resp
                })
            })
            .fail(function (err) {
                //handle error with err
                console.error(err)
            })
        },

        submit() {
            var result = {}
            schema.forEach((x) => {
                var val = $(`input[name=${x.name}`).val()
                if (val !== "") {
                    if (x.array) {
                        val = val.split(',')
                    }
                    result[x.name] = val
                }
            })
            app.result = JSON.stringify(result)

            this.commit("g0v.json", app.result)
        },

        commit(filename, content) {
            var x = app.user
            var currentHEADCommit
            var newBlob
            var branch
            app.conn.get(`/repos/${x.login}/metadata-editor/git/refs/heads/master`)
            .then(function (currentHEAD) {
                return app.conn.get(currentHEAD.object.url)
            })
            .then(function (HEADCommit) {
                currentHEADCommit = HEADCommit
                return app.conn.post(`/repos/${x.login}/metadata-editor/git/blobs`, {data: JSON.stringify({content: content, encoding: "utf-8"})})
            })
            .then(function (blob) {
                newBlob = blob
                return app.conn.get(currentHEADCommit.tree.url)
            })
            .then(function (currentHEADtree) {
                return app.conn.post(`/repos/${x.login}/metadata-editor/git/trees`, {data: JSON.stringify({base_tree: currentHEADtree.sha, tree: [
                    {
                        path: "g0v.json",
                        mode: "100644",
                        type: "blob",
                        sha: newBlob.sha
                    }
                ]})})
            })
            .then(function (newTree) {
                return app.conn.post(`/repos/${x.login}/metadata-editor/git/commits`, { data: JSON.stringify({
                    message: "update g0v.json",
                    tree: newTree.sha,
                    parents: [currentHEADCommit.sha]})})
            })
            .then(function (newCommit) {
                branch = `update-g0v-json-${Date.now()}`
                return app.conn.post(`/repos/${x.login}/metadata-editor/git/refs`, { data: JSON.stringify({sha: newCommit.sha, ref: `refs/heads/${branch}`})})
            })
            .then(function (newRef) {
                return app.conn.post(`/repos/${x.login}/metadata-editor/pulls`, { data: JSON.stringify({
                    title: "update g0v.json",
                    body: "this is a pull request from metadata-editor",
                    head: `${x.login}:${branch}`,
                    base: `master`
                })})
            })
        }
    }
})

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

