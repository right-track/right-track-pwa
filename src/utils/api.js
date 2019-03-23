const config = require('./config.js').api;


/**
 * Make a GET request to the specified API Path
 * @param  {string} path API Request Path
 * @param  {boolean} [binary] Flag for binary data (images, etc)
 * @param  {Function} callback Callback function(err, response)
 */
function get(path, binary, callback) {
    _request("GET", path, null, binary, callback);
}

/**
 * Make a POST request to the specified API Path with the 
 * specified request body
 * @param  {string}   path     API Request Path
 * @param  {Object}   body     API Request Body
 * @param  {Function} callback Callback function(err, response)
 */
function post(path, body, callback) {
    _request("POST", path, body, false, callback);
}

/**
 * Make a DELETE request to the specified API Path
 * @param  {[type]}   path     API Request Path
 * @param  {Function} callback Callback function(err, response)
 */
function del(path, callback) {
    console.log("[DELETE] " + path);
    _request("DELETE", path, null, false, callback);
}


/**
 * Make a request to the API Server
 * @param  {string} method HTTP Method
 * @param  {string} path API Request Path
 * @param  {Object} body POST request body (as JS Object)
 * @param  {boolean} [binary] Flag for binary data (images, etc)
 * @param  {Function} callback Callback function(err, response)
 */
function _request(method, path, body, binary, callback) {
    const user = require('./user.js');
    console.log("--> API REQUEST [" + method + "] " + path);

    // Parse arguments
    if ( callback === undefined && binary instanceof Function ) {
        callback = binary;
        binary = false;
    }
    
    // Set URL to Config API Host
    let url = path.includes("http") ? path : config.host + path;
    
    // Set Request
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Authorization", "Token " + config.clientKey);
    xhr.responseType = binary ? "arraybuffer" : "text";

    // Set Listener
    xhr.onload = function(e) {
        if ( xhr.response ) {

            // PARSE JSON RESPONSE
            if ( !binary ) {
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
                    return callback(new Error("[" + xhr.status + "] Invalid API Response"));
                }
            }

        }

        // Request Failure
        return callback(new Error("Could not make API request to " + path));

    };

    // Get Session Info
    user.isLoggedIn(function (isLoggedIn, userInfo, sessionInfo) {
            
        // Add Session Token to request
        if ( isLoggedIn ) {
            xhr.setRequestHeader("X-Session-Token", sessionInfo.id);
        }

        // Send the Request
        if ( method === "POST" ) {
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify(body));
        }
        else {
            xhr.send();
        }

    });

}

module.exports = {
    get: get,
    post: post,
    del: del
}