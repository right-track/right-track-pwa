const api = require("@/utils/api.js");
const config = require("@/utils/config.js");
const store = require("@/utils/store.js");


// CLIENT URLs
const PASSWORD_RESET_PATH = "/auth/reset";
const EMAIL_VERIFICATION_PATH = "/auth/verify";



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
 * @param  {string}   login    User username or email
 * @param  {string}   agency   Agency ID
 * @param  {string}   src      Login source
 * @param  {Function} callback Callback function(err, confirmation)
 */
function requestPasswordReset(login, agency, src, callback) {

    // Set Client URL
    let url = window.location.protocol + "//" + window.location.host + PASSWORD_RESET_PATH;
    if ( agency ) {
        url += "?agency=" + agency;
        if ( src ) {
            url += "&src=" + src;
        }
    }
    else if ( src ) {
        url += "?src=" + src;
    }
    url = encodeURIComponent(url);

    // Request Password Reset
    api.get("/auth/reset?user=" + login + "&url=" + url, function(err, resp) {
        if ( err || !resp || !resp.token || !resp.confirmation ) {
            return callback(err);
        }
        resp.token.created = new Date(resp.token.created).toLocaleString();
        resp.token.expires = new Date(resp.token.expires).toLocaleString();
        return callback(null, resp);
    });

}


/**
 * Reset the User's password using a password reset token
 * @param  {string}   user     User PID
 * @param  {string}   token    Password Reset Token
 * @param  {string}   password New password
 * @param  {Function} callback Callback function(err)
 */
function resetPassword(user, token, password, callback) {
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


/**
 * Request an email verification token be sent to the User's email address
 * @param  {string}   agency   Agency ID
 * @param  {string}   src      Verification source
 * @param  {Function} callback Callback function(err, confirmation)
 */
function requestEmailVerification(agency, src, callback) {

    // Set Client URL
    let url = window.location.protocol + "//" + window.location.host + EMAIL_VERIFICATION_PATH;
    if ( agency ) {
        url += "?agency=" + agency;
        if ( src ) {
            url += "&src=" + src;
        }
    }
    else if ( src ) {
        url += "?src=" + src;
    }
    url = encodeURIComponent(url);

    // Get Logged In User
    isLoggedIn(function(isLoggedIn, user) {
        if ( !isLoggedIn ) {
            return callback(new Error("The User is not logged in."));
        }

        // Request Email Verification Token
        api.get("/users/" + user.id + "/verify?url=" + url, function(err, resp) {
            if ( err || !resp || !resp.token || !resp.confirmation ) {
                return callback(err);
            }
            resp.token.created = new Date(resp.token.created).toLocaleString();
            resp.token.expires = new Date(resp.token.expires).toLocaleString();
            return callback(null, resp);
        });
    });

}


/**
 * Verify the specified email token for the logged in User
 * @param  {string}   token    Email Verification Token
 * @param  {Function} callback Callback function(err, user)
 */
function verifyEmail(token, callback) {

    // Get Logged In User
    isLoggedIn(function(isLoggedIn, user) {
        if ( !isLoggedIn ) {
            return callback(new Error("The User is not logged in."));
        }

        // Verify Token
        let body = {token: token};
        api.put("/users/" + user.id + "/verify", body, function(err, resp) {
            if ( err ) {
                return callback(err);
            }

            // Refresh User
            refreshUser(function(err, user) {
                return callback(err, user);
            });
        });

    });
       
}


/**
 * Update the username of the logged in User
 * @param  {string}   username New username
 * @param  {Function} callback Callback function(err, user)
 */
function updateUsername(username, callback) {
    return updateUser({username: username}, callback);
}


/**
 * Update the email address of the logged in User
 * @param  {string}   email    New email address
 * @param  {Function} callback Callback function(err, user)
 */
function updateEmail(email, callback) {
    return updateUser({email: email}, callback);
}


/**
 * Update the password of the logged in User
 * @param  {string}   current  Current password
 * @param  {string}   update      New password
 * @param  {Function} callback Callback function(err, user)
 */
function updatePassword(current, update, callback) {
    return updateUser({
        password: {
            current: current,
            new: update
        }
    }, callback);
}


/**
 * Update properties of the logged in User
 * @param  {object}   properties New properties for the logged in User
 * @param  {string}   properties.email  New email address
 * @param  {string}   properties.username  New username
 * @param  {object}   properties.passsord  New password properties {current: , new: }
 * @param  {Function} callback   Callback function(err, user)
 */
function updateUser(properties, callback) {

    // Make sure the User is currently logged in
    isLoggedIn(function(isLoggedIn, user) {

        // If not logged in
        if ( !isLoggedIn ) {
            return callback(new Error("The User is not currently logged in."));
        }

        // Make API Request
        api.put("/users/" + user.id, properties, function(err, resp) {
            if ( err ) {
                return callback(err);
            }

            // Refresh User
            refreshUser(function(err, user) {
                return callback(err, user);
            });

        });
    });

}


/**
 * Refresh the information of the currently logged in User
 * @param  {Function} callback Callback function(err, user)
 */
function refreshUser(callback) {

    // Make sure the User is currently logged in
    isLoggedIn(function(isLoggedIn, user) {
        
        // If not logged in...
        if ( !isLoggedIn ) {
            return callback();
        }
        
        // Get fresh User info
        api.get("/users/" + user.id, function(err, resp) {
            if ( err ) {
                return callback(err);
            }
            if ( !resp.user ) {
                return callback(new Error("No User information returned from the server"));
            }
            else {
                if ( resp.user.sessions ) {
                    delete resp.user.sessions;    
                }
                store.put("user", resp.user);
                return callback(null, resp.user);   
            }
        });

    });

}


/**
 * Delete the User from the API Server
 * @param  {Function} callback Callback function(err)
 */
function deleteUser(callback) {

    // Make sure the User is currently logged in
    isLoggedIn(function(isLoggedIn, user) {

        // If not logged in...
        if ( !isLoggedIn ) {
            return callback(new Error("The User is currently not logged in."));
        }

        // Delete the User
        api.del("/users/" + user.id, function(err) {
            if ( err ) {
                return callback(err);    
            }

            // Clear user settings
            store.del("user", function() {
                store.del("session", function() {
                    store.delFavorites(function(err) {
                        return callback()
                    });
                });    
            });
        });

    });

}





module.exports = {
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getRegistrationRequirements: getRegistrationRequirements,
    register: register,
    requestPasswordReset: requestPasswordReset,
    resetPassword: resetPassword,
    requestEmailVerification: requestEmailVerification,
    verifyEmail: verifyEmail,
    updateUsername: updateUsername,
    updateEmail: updateEmail,
    updatePassword: updatePassword,
    updateUser: updateUser,
    deleteUser: deleteUser
}