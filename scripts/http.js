function authorize(r) {
    r.subrequest("/_authorize")
        .then(response => {
            if (response.status === 200) {
                r.headersOut["deps-token"] = response.headersOut["deps-token"]
                r.return(200)
            } else {
                r.return(response.status, response.statusText)
            }
        })
}

function select_auth_server(r) {
    var authorizationEnabled = process.env.AUTHORIZATION_ENABLED;
    if (authorizationEnabled === "true") {
        return "http://127.0.0.1:8001";
    } else {
        var url = process.env.UPSTREAM_AUTH_URL;
        var uri = process.env.AUTH_URI;

        return url + uri;
    }
}

export default {
    authorize, select_auth_server
}
