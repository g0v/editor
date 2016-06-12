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
        optional: false
    },
    {
        type: "text",
        name: "keywords",
        placeholder: "foo, bar",
        label: "keywords",
        optional: false
    },
    {
        type: "text",
        name: "audience",
        placeholder: "public",
        label: "audience",
        optional: false
    },
    {
        type: "text",
        name: "products",
        placeholder: "urls...",
        label: "products",
        optional: false
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
        optional: false
    },
    {
        type: "text",
        name: "needs",
        placeholder: "needs...",
        label: "Needs",
        optional: false
    },
]

var app = new Vue({
    el: '#app',
    data: { message: "hello", schema: schema, result: "" },
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
                // do some stuff with result
            })
        },

        submit() {
            var result = {}
            schema.forEach((x) => {
                var val = $(`input[name=${x.name}`).val()
                if (val !== "")
                result[x.name] = val
            })
            app.result = JSON.stringify(result)
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
