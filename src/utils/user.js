const api = require("./api.js");
const config = require("./config.js");

const USER_CACHE = "rtuser-cache-" + config.api.host;


/**
 * User Login
 * @param  {string}   user     Username or email address
 * @param  {string}   pass     Password
 * @param  {Function} callback Callback function(err)
 */
function login(user, pass, callback) {

    // Check user and pass
    if ( user === null || user === "" ) {
        return callback(new Error("Username or email address required"));
    }
    if ( pass === null || pass === "" ) {
        return callback(new Error("Password required"));
    }

    // Send API request
    api.post("/auth/login", {login: user, password: pass}, function(err, response) {
        if ( err ) {
            return callback(err);
        }
        
        // Save login response
        _putCache("user", response.user, function() {
            _putCache("session", response.session, function() {
                return callback(null, response.user);
            });
        });

    });

}


/**
 * User Logout
 * @param  {[type]} finished Callback function()
 */
function logout(finished) {

    // Logout: server then local
    _server(function() {
        _local(function() {
            return finished();
        });
    });


    // SERVER LOGOUT
    function _server(callback) {

        // Get Cached User Info
        _getCache("user", function(user) {

            // API Logout Request
            if ( user ) {
                api.del("/auth/logout/" + user.id, function() {
                    return callback();
                });
            }
            else {
                return callback();
            }

        });

    }

    // LOCAL LOGOUT
    function _local(callback) {

        // Remove cache entries
        _removeCache("user", function() {
            _removeCache("session", function() {
                return callback();
            });
        });

    }

}


/**
 * Check if there is a valid logged in user.  Return 
 * the user and session info if there is
 * @param  {Function} callback Callback function(isLoggedIn, user, session)
 */
function isLoggedIn(callback) {

    // Get User and Session Info
    _getCache("user", function(user) {
        _getCache("session", function(session) {
            // User or session info not found
            if ( user === null || session === null ) {
                return callback(false);
            }

            // Check session info
            if ( !session.inactive || !session.expires ) {
                return callback(false)
            }
            let now = new Date();
            if ( now >= session.inactive || now >= session.expires ) {
                return callback(false);
            }

            // Session is valid
            return callback(true, user, session);

        });
    });

}



/**
 * Get cached data for the specified cache key
 * @param  {string} key Cache key
 * @param  {Function} callback Callback function(cache)
 */
function _getCache(key, callback) {
    key = config.api.host + "/auth/login/" + key;

    // Get the RT User Cache
    caches.open(USER_CACHE).then(function(cache) {

        // Check for matching request
        cache.match(key).then(function(response) {

            // Cache match found...
            if ( response ) {
                response.text().then(function(cacheText) {
                    let cached = JSON.parse(cacheText);
                    return callback(cached);
                });
            }

            // No cache match found...
            else {
                return callback(null);
            }
            
        });

    });
}


/**
 * Save the specified data to the cache
 * @param  {string} key Cache key
 * @param  {Object} value Value (to be parsed to JSON)
 * @param  {Function} callback Callback function()
 */
function _putCache(key, value, callback) {
    key = config.api.host + "/auth/login/" + key;

    // Get the RT User Cache
    caches.open(USER_CACHE).then(function(cache) {

        // Create Blob for Response
        let blob = new Blob([JSON.stringify(value)], {type: 'application/json'});

        // Build a Response to put in the cache
        let cacheResponse = new Response(blob, {status: 200});

        // Add Response to cache
        cache.put(key, cacheResponse);

        // Return
        return callback();

    });
}


/**
 * Remove the specified data from the cache
 * @param  {string}   key      Cache key
 * @param  {Function} callback Callback function()
 */
function _removeCache(key, callback) {
    key = config.api.host + "/auth/login/" + key;

    // Get the RT User Cache
    caches.open(USER_CACHE).then(function(cache) {
        cache.delete(key).then(function() {
            return callback();
        });
    });
}





module.exports = {
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn
}