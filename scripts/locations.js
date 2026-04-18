const uriFactory = (r, envDefaultUrl, disableOptions) => {
    const defaultUrl = process.env[envDefaultUrl];

    for (let optionIdx = 0; optionIdx < disableOptions.length; optionIdx++) {
        let option = disableOptions[optionIdx];

        if(!Array.isArray(option) || option.length !== 3) {
            r.error("[uriFactory] Invalid option. Disability option must consist of three values: envVar, methodList, uri");
            return r.return(500, "Nginx error");
        }

        const envDisableFlag = option[0];
        const disableAction = process.env[envDisableFlag] !== "true";

        const restrictedMethodsList = option[1];
        const restrictedUrl = new RegExp(option[2]);

        if(disableAction && restrictedMethodsList.includes(r.method) && restrictedUrl.test(r.uri)) {
            r.warn(`Endpoint ${r.uri} for method: ${r.method} is disabled, you may enable it by setting env variable ${envDisableFlag} to 'true'`);
            return r.return(404, "This endpoint is disabled.");
        }
    }

    return defaultUrl;
}


function get_document_api_path(r) {
    return uriFactory(
        r,
        "UPSTREAM_BACKEND_URL",
        [
            ["FEATURE_DOCUMENT_CHANGE_TYPE", ["POST"], "^/api/document/v1/documents/assign-type$"],
            ["FEATURE_DOCUMENT_UPLOAD", ["POST"], "^/api/document/v1/documents/document-file$"],
            ["FEATURE_DOCUMENT_UPLOAD", ["POST"], "^/api/document/v1/documents/multi-upload-session$"],
            ["FEATURE_DOCUMENT_DELETE", ["DELETE"], "^/api/document/v1/documents/[^/]+$"],
            ["FEATURE_DOCUMENT_UPLOAD", ["POST"], "^/api/document/v1/documents$"],
            ["FEATURE_DOCUMENT_DELETE", ["DELETE"], "^/api/document/v1/documents$"],
            ["FEATURE_RUN_PIPELINE", ["POST"], "^/api/document/v1/documents/run-pipeline$"],
            ["FEATURE_RUN_PIPELINE", ["POST"], "^/api/document/v1/documents/run-pipeline-from-step$"],
            ["FEATURE_RUN_PIPELINE", ["POST"], "^/api/document/v1/documents/retry-last-step$"],
            ["FEATURE_RUN_PIPELINE", ["POST"], "^/api/document/v1/documents/extract-data$"],
        ]
    )
}

function get_corleone_api_path(r) {
    return uriFactory(
        r,
        "UPSTREAM_CORLEONE_URL",
        [
            ["FEATURE_RUN_PIPELINE", ["POST"], "^/api/corleone/v1/extract$"],
            ["FEATURE_MODEL_MANAGEMENT", ["POST"], "^/api/corleone/v1/types$"],
            ["FEATURE_MODEL_MANAGEMENT", ["DELETE"], "^/api/corleone/v1/types/[^/]+$"],
            ["FEATURE_MODEL_MANAGEMENT", ["DELETE", "PUT"], "^/api/corleone/v1/types/[^/]+/fields/[^/]+$"],
            ["FEATURE_MODEL_MANAGEMENT", ["POST"], "^/api/corleone/v1/types/[^/]+/fields$"],
            ["FEATURE_MODEL_MANAGEMENT", ["PUT"], "^/api/corleone/v1/plugins/register$"],
            ["FEATURE_MODEL_MANAGEMENT", ["PUT", "POST", "DELETE"], "^/api/corleone/v1/types/[^/]+/models$"],
            ["FEATURE_MODEL_MANAGEMENT", ["DELETE"], "^/api/corleone/v1/types/[^/]+/models/[^/]+$"],
            ["FEATURE_MODEL_MANAGEMENT", ["PUT"], "^/api/corleone/v1/types/[^/]+/models/[^/]+/templates/[^/]+/fields$"],
            ["FEATURE_MODEL_MANAGEMENT", ["POST"], "^/api/corleone/v1/types/[^/]+/models/[^/]+/models/templates$"],
        ],
    )
}


export default {
    get_document_api_path, get_corleone_api_path
}
