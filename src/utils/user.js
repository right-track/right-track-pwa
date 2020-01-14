const api = require("@/utils/api.js");
const config = require("@/utils/config.js");
const store = require("@/utils/store.js");


// PASSWORD RESET PATH
const PASSWORD_RESET_PATH = "/auth/reset";



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
 * @param  {[type]} [finished] Callback function()
 */
function logout(finished) {

    // Logout: server then local
    _server(function() {
        _local(function() {
            if ( finished ) return finished();
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


/**
 * Get the user registration requirements
 * @param  {Function} callback Callback function({usernameRequirements, usernameHint, passwordRequirements, passwordHint})
 */
function getRegistrationRequirements(callback) {
    let rtn = {
        usernameRequirements: {},
        usernameHint: "",
        passwordRequirements: {},
        passwordHint: ""
    }

    // Get requirements from API Server
    api.get("/users", function(err, response) {
        if ( !err ) {

            // Parse username requirements
            let ur = response.requirements.username;
            rtn.usernameRequirements = {
                cannotContain: ur.cannotContain,
                minLength: ur.minLength,
                maxLength: ur.maxLength
            }
            
            // Set username hint
            let cc = ur.cannotContain.split('');
            cc[cc.indexOf(' ')] = "space";
            rtn.usernameHint = "Cannot contain '" + cc.join(',') + "' and must be between " + ur.minLength + " and " + ur.maxLength + " characters long.";
            
            // Parse password requirements
            let pr = response.requirements.password;
            rtn.passwordRequirements = {
                blockUsername: pr.blockUsername,
                minLength: pr.minLength,
                maxLength: pr.maxLength,
                requireDigits: pr.requireDigits,
                requireLetters: pr.requireLetters,
                requireLowercase: pr.requireLowercase,
                requireSymbols: pr.requireSymbols,
                requireUppercase: pr.requireUppercase
            }

            // Set password hint
            let ph = "Must be between " + pr.minLength + " and " + pr.maxLength + " characters long";
            let phr = [];
            if ( pr.requireDigits ) phr.push("digit");
            if ( pr.requireLetters ) phr.push("letter");
            if ( pr.requireLowercase ) phr.push("lowercase letter");
            if ( pr.requireUppercase ) phr.push("uppercase letter");
            if ( pr.requireSymbols ) phr.push("symbol");
            if ( phr.length > 0 ) {
                ph = ph + " and contain at least one " + phr.join(", ");
            }
            rtn.passwordHint = ph;

        }

        return callback(rtn);
    });
}

/**
 * Register a new account
 * @param  {string}   email    Email address
 * @param  {string}   username Username
 * @param  {string}   password password
 * @param  {Function} callback Callback function(err)
 */
function register(email, username, password, callback) {
    let body = {
        email: email,
        username: username,
        password: password
    }
    api.post("/users", body, function(err, resp) {
        return callback(err);
    });
}


/**
 * Request a Password Reset link be sent to the specified User
 * @param  {string}   user     User username or email
 * @param  {string}   agency   Agency ID
 * @param  {string}   src      Login source
 * @param  {Function} callback Callback function(err, confirmation)
 */
function requestPasswordReset(user, agency, src, callback) {

    // Set Client URL
    let url = window.location.protocol + "//" + window.location.host + PASSWORD_RESET_PATH;
    url += "?agency=" + agency + "&src=" + src;
    url = encodeURIComponent(url);

    // Request Password Reset
    api.get("/auth/reset?user=" + user + "&url=" + url, function(err, resp) {
        if ( err || !resp || !resp.token || !resp.confirmation ) {
            return callback(err);
        }
        resp.token.created = new Date(resp.token.created);
        resp.token.expires = new Date(resp.token.expires);
        return callback(null, resp);
    });

}


/**
 * Update the specified User's password
 * @param  {string}   user     User PID
 * @param  {string}   token    Password Reset Token
 * @param  {string}   password New password
 * @param  {Function} callback Callback function(err)
 */
function updatePassword(user, token, password, callback) {
    let body = {
        user: user,
        password: {
            token: token,
            new: password
        }
    }
    api.put("/auth/reset", body, function(err, resp) {
        return callback(err);
    });
}



module.exports = {
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getRegistrationRequirements: getRegistrationRequirements,
    register: register,
    requestPasswordReset: requestPasswordReset,
    updatePassword: updatePassword
}