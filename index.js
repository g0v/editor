var schema = [
    {
        type: "text",
        name: "author",
        placeholder: "you",
        label: "Author",
        optional: false
    },
    {
        type: "text",
        name: "status",
        placeholder: "planning",
        label: "Status",
        optional: false
    },
    {
        type: "text",
        name: "name",
        placeholder: "project name",
        label: "Name",
        optional: false
    },
    {
        type: "text",
        name: "name_zh",
        placeholder: "project name in zh",
        label: "中文名稱",
        optional: false
    },
    {
        type: "text",
        name: "description",
        placeholder: "description",
        label: "Description",
        optional: false
    },
    {
        type: "text",
        name: "description_zh",
        placeholder: "description_zh",
        label: "中文敘述",
        optional: false
    },
    {
        type: "text",
        name: "homepage",
        placeholder: "homepage url",
        label: "專案網址",
        optional: false
    },
    {
        type: "text",
        name: "thumbnail",
        placeholder: "thumbnail",
        label: "thumbnail",
        optional: false
    },
    {
        type: "text",
        name: "document",
        placeholder: "document",
        label: "document",
        optional: false
    },
    {
        type: "text",
        name: "repository",
        placeholder: "repository url",
        label: "repository",
        optional: false
    },
    {
        type: "text",
        name: "licenses",
        placeholder: "licenses",
        label: "licenses",
        optional: false,
        array: true
    },
    {
        type: "text",
        name: "keywords",
        placeholder: "foo, bar",
        label: "keywords",
        optional: false,
        array: true
    },
    {
        type: "text",
        name: "audience",
        placeholder: "public",
        label: "audience",
        optional: false,
        array: true
    },
    {
        type: "text",
        name: "products",
        placeholder: "urls...",
        label: "products",
        optional: false,
        array: true
    },
    {
        type: "text",
        name: "partOf",
        placeholder: "parent project",
        label: "Part Of",
        optional: false
    },
    {
        type: "text",
        name: "contributors",
        placeholder: "contributors...",
        label: "contributors",
        optional: false,
        array: true
    },
    {
        type: "text",
        name: "needs",
        placeholder: "needs...",
        label: "Needs",
        optional: false,
        array: true
    },
]

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
                console.log(err)
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
            app.conn.get(`/repos/${x.login}/metadata-editor/git/refs/heads/master`)
            .then(function (currentHEAD) {
                console.log(content)
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
                console.log('new tree', newTree.sha)
                return app.conn.post(`/repos/${x.login}/metadata-editor/git/commits`, { data: JSON.stringify({
                    message: "update g0v.json",
                    tree: newTree.sha,
                    parents: [currentHEADCommit.sha]})})
            })
            .then(function (newCommit) {
                console.log('newCommit', newCommit)
                return app.conn.post(`/repos/${x.login}/metadata-editor/git/refs`, { data: JSON.stringify({sha: newCommit.sha, ref: `refs/heads/update-g0v-json-${Date.now()}`})})
            })
            .then(function (newHEAD) {
                console.log('newHEAD', newHEAD)
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

