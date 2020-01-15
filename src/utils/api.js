const config = require('@/utils/config.js').api;

/**
 * Make a GET request to the specified API Path
 * @param  {string} path API Request Path
 * @param  {boolean} [binary] Flag for binary data (images, etc)
 * @param  {Function} callback Callback function(err, response)
 */
function get(path, binary, callback) {
    if ( callback === undefined && typeof binary === 'function' ) {
        callback = binary;
        binary = false;
    }
    _request("GET", path, null, binary, true, callback);
}

/**
 * Download a large binary file and monitor the progress
 * @param  {string}   path     API Request Path
 * @param  {Function} progress Progress callback function(percent)
 * @param  {Function} callback Callback function(err, response)
 */
function download(path, progress, callback) {
    _request("GET", path, null, true, false, callback, progress);
}

/**
 * Make a POST request to the specified API Path with the 
 * specified request body
 * @param  {string}   path     API Request Path
 * @param  {Object}   body     API Request Body
 * @param  {Function} callback Callback function(err, response)
 */
function post(path, body, callback) {
    _request("POST", path, body, false, false, callback);
}

/**
 * Make a PUT request to the specified API Path with the 
 * specified request body
 * @param  {string}   path     API Request Path
 * @param  {Object}   body     API Request Body
 * @param  {Function} callback Callback function(err, response)
 */
function put(path, body, callback) {
    _request("PUT", path, body, false, false, callback);
}

/**
 * Make a DELETE request to the specified API Path
 * @param  {[type]}   path     API Request Path
 * @param  {Function} callback Callback function(err, response)
 */
function del(path, callback) {
    _request("DELETE", path, null, false, false, callback);
}


/**
 * Make a request to the API Server
 * @param  {string} method HTTP Method
 * @param  {string} path API Request Path
 * @param  {Object} body POST request body (as JS Object)
 * @param  {boolean} binary Flag for binary data (images, etc)
 * @param  {boolean} parseBinary Flag to parse binary data to base64
 * @param  {Function} callback Callback function(err, response)
 * @param  {Function} [progress] Progress callback function(percent, loaded, total)
 */
function _request(method, path, body, binary, parseBinary, callback, progress) {
    const user = require('@/utils/user.js');                                // TODO: Fix Circular Dependency
    console.log("--> API REQUEST [" + method + "] " + path);
    
    // Set URL to Config API Host
    let url = path.startsWith("http") ? path : config.host + path;

    // Get Session Info
    user.isLoggedIn(function (isLoggedIn, userInfo, sessionInfo) {

        // Set Request
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader("Authorization", "Token " + config.clientKey);
        xhr.responseType = binary ? "arraybuffer" : "text";

        // Set Progress Listener
        xhr.onprogress = function(event) {
            if ( progress ) progress((event.loaded/event.total)*100, event.loaded, event.total);
        }

        // Set Error Listener
        xhr.onerror = function() {
            console.log("XHR ERROR [" + method + " " + path + "]");
            return callback(new Error("Could not make API request. Please try again later."));
        }

        // Set Load Listener
        xhr.onload = function(e) {
            if ( xhr.response ) {

                // HANDLE EXPIRED USER SESSION
                let logout_on_auth_failed = true;
                if ( path === "/auth/login" || path === "/auth/reset" ) {
                    logout_on_auth_failed = false;
                }
                else if ( isLoggedIn && method === "PUT" && path === "/users/" + userInfo.id ) {
                    logout_on_auth_failed = false;
                }
                
                // LOGOUT USER IF EXPIRED SESSION
                if ( xhr.status === 401 && logout_on_auth_failed ) {
                    user.logout(function() {
                        location.reload();
                    });
                    return callback(new Error("Session Expired - You have been logged out."));
                }

                // PARSE JSON RESPONSE
                else if ( !binary ) {
                    try {

                        // Parse Response to JSON
                        var resp = JSON.parse(xhr.response);
                    
                        // Request Success
                        if ( resp.status === "success" ) {
                            return callback(null, resp.response);
                        }

                        // Request Error
                        else if ( resp.status === "error" ) {
                            return callback(new Error("[" + resp.error.type + "] " + resp.error.message));
                        }

                    }
                    catch(err) {
                        console.log("API Response Error: " + err);
                        console.log(xhr.response);
                    }
                }

                // PARSE BINARY RESPONSE
                else {
                    if ( xhr.status === 200 ) {
                        if ( parseBinary ) {
                            var uInt8Array = new Uint8Array(xhr.response);
                            var i = uInt8Array.length;
                            var binaryString = new Array(i);
                            while (i--) {
                              binaryString[i] = String.fromCharCode(uInt8Array[i]);
                            }
                            var data = binaryString.join('');
                            var base64 = window.btoa(data);
                            return callback(null, base64);
                        }
                        else {
                            return callback(null, xhr.response);
                        }
                    }
                    else {
                        return callback(new Error("[" + xhr.status + "] Invalid API Response"));
                    }
                }

            }

            // Request Failure
            return callback(new Error("Could not make API request to " + path));

        };
            
        // Add Session Token to request
        if ( isLoggedIn ) {
            xhr.setRequestHeader("X-Session-Token", sessionInfo.id);
        }

        // Send POST Request (w/ Content-Type and Body)
        if ( method === "POST" || method === "PUT" ) {
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify(body));
        }

        // Send all other Requests
        else {
            xhr.send();
        }

    });

}

module.exports = {
    get: get,
    post: post,
    put: put,
    del: del,
    download: download
}