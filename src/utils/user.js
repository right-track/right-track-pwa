const api = require("@/utils/api.js");
const config = require("@/utils/config.js");
const store = require("@/utils/store.js");


/**
 * User Login
 * @param  {string}   user     Username or email address
 * @param  {string}   pass     Password
 * @param  {Function} callback Callback function(err, user)
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
        store.delFavorites(function() {
            store.put("user", response.user);
            store.put("session", response.session);

            // Return with user information
            return callback(null, response.user);
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
        store.get("user", function(err, user) {
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
        store.del("user", function() {
            store.del("session", function() {
                store.delFavorites(function(err) {
                    return callback()
                });
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
    store.get("user", function(err, user) {
        store.get("session", function(err, session) {

            // User or session info not found
            if ( user === undefined || session === undefined ) {
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




module.exports = {
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn
}