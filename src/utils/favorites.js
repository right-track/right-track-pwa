const user = require("@/utils/user.js");
const cache = require("@/utils/cache.js");
const store = require("@/utils/store.js");
const api = require("@/utils/api.js");

let GETTING_FAVS = false;
let GETTING_FAVS_CALLBACKS = [];

// Interval to check server favorites (ms)
const CHECK_INTERVAL = 60 * 1000;


/**
 * Add Icon and Label to each favorite before returning to the app
 * @param  {Array} favorites List of favorites to return
 * @return {Array} List of parsed favorites
 */
function _parseFavorites(favorites, fresh) {
    if ( favorites ) {
        for ( let i = 0; i < favorites.length; i++ ) {
            if ( favorites[i].type === 1 ) {
                favorites[i].icon = "access_time";
                favorites[i].label = favorites[i].stop.name;
            }
            else if ( favorites[i].type === 2 ) {
                favorites[i].icon = "train";
                favorites[i].label = favorites[i].origin.name + " to " + favorites[i].destination.name;
            }
        }
        return favorites;
    }
    else {
        return [];
    }
}


/**
 * Get the Favorites for the specified agency.  First, return 
 * the local favorites (empty array if none).  Then, if a User 
 * is logged in, return the server favorites (if `force` or 
 * have not been checked recently).
 * @param  {String}   agencyId Agency ID code
 * @param  {boolean}  [force]  Force to get the server favorites
 * @param  {Function} callback Callback function(err, favorites, fresh)
 */
function get(agencyId, force, callback) {

    // Parse arguments
    if ( callback === undefined && typeof force === 'function' ) {
        callback = force;
        force = false;
    }

    // Get the local favorites, if any
    _getLocalFavorites(agencyId, function(local) {

        // Return the local favorites
        callback(null, _parseFavorites(local), false);

        // Check if user is logged in
        user.isLoggedIn(function(isLoggedIn, userInfo) {
            if ( isLoggedIn ) {

                // Get the last check time
                _getLastCheck(agencyId, function(lastCheck) {

                    // Get server favorites, if force or need to be updated
                    let delta = (new Date().getTime()) - lastCheck;
                    if ( force || delta > CHECK_INTERVAL ) {

                        // Start Callback queue
                        GETTING_FAVS_CALLBACKS.push(callback);
                        if ( !GETTING_FAVS ) {
                            GETTING_FAVS = true;

                            // Get favorites from server
                            api.get("/favorites/" + agencyId + "/" + userInfo.id + "?t=" + new Date().getTime(), function(err, response) {

                                // API ERROR: return error, if forced
                                if ( err ) {
                                    _finish(err, undefined, force);
                                }

                                // API SUCCESS: update favorites
                                else {

                                    // Save the Last Check
                                    _updateLastCheck(agencyId);

                                    // Compare last modified dates
                                    _getLastModified(agencyId, function(localLastMod) {
                                        let serverLastMod = new Date(response.lastModified);

                                        // SERVER NEWER: Update local
                                        if ( serverLastMod > localLastMod ) {
                                            _saveLocalFavorites(agencyId, response);
                                            _finish(null, _parseFavorites(response.favorites), true);
                                        }

                                        // LOCAL NEWER: Update Server
                                        else if ( localLastMod > serverLastMod ) {
                                            _saveServerFavorites(agencyId, local, function(err, updatedFavorites) {
                                                if ( err ) {
                                                    _finish(err, undefined, force);
                                                }
                                                else {
                                                    _finish(null, _parseFavorites(updatedFavorites), true);
                                                }
                                            });
                                        }

                                        else {
                                            _finish(null, _parseFavorites(response.favorites), true);
                                        }

                                    });

                                }

                            });

                        }

                    }

                });

            }
        });

    });

    /**
     * Getting favorites has finished, return favorites to callbacks
     * @param  {Error}    err    Error
     * @param  {Array[]}  favs   Favorites
     * @param  {boolean} [force] True if forced
     */
    function _finish(err, favs, force) {
        for ( let i = 0; i < GETTING_FAVS_CALLBACKS.length; i++ ) {
            let callback = GETTING_FAVS_CALLBACKS[i];
            if ( err ) {
                if ( force ) callback(err);
            }
            else {
                callback(null, favs, true);
            }
        }
        GETTING_FAVS_CALLBACKS = [];
        GETTING_FAVS = false;
    } 

}


/**
 * Add the specified Stop as a Favorite Station
 * @param {string}   agencyId Agency ID code
 * @param {Object}   stop     Stop
 * @param {Function} callback Callback function(err, favorites)
 */
function addStation(agencyId, stop, callback) {

    // Get Current favorites
    _getLocalFavorites(agencyId, function(favorites) {

        // Add Stop to favorites list
        favorites.push({
            type: 1,
            sequence: favorites.length > 0 ? favorites[favorites.length-1].sequence + 1 : 1,
            stop: {
                id: stop.id,
                name: stop.name
            },
            options: {}
        });

        // Update the favorites
        _update(agencyId, favorites, function(err, updatedFavorites) {
            if ( err ) {
                return callback(err);
            }
            return callback(null, _parseFavorites(updatedFavorites));
        });

    });

}

/**
 * Remove the specified Stop as a Favorite Station
 * @param  {String}   agencyId Agency ID code
 * @param  {Object}   stop     Station Stop
 * @param  {Function} callback Callback function(err, favorites)
 */
function removeStation(agencyId, stop, callback) {

    // Get Current favorites
    _getLocalFavorites(agencyId, function(favorites) {

        // List of favorites to keep
        let keep = [];

        // Parse existing favorites
        for ( let i = 0; i < favorites.length; i++ ) {
            if ( favorites[i].type !== 1 || (favorites[i].type === 1 && favorites[i].stop.id !== stop.id) ) {
                keep.push(favorites[i]);
            }
        }

        // Update the favorites
        _update(agencyId, keep, function(err, updatedFavorites) {
            if ( err ) {
                return callback(err);
            }
            return callback(null, _parseFavorites(updatedFavorites));
        });

    });

}

/**
 * Add the specified Stops as a Favorite Trip
 * @param {string}   agencyId    Agency ID code
 * @param {Object}   origin      Origin Stop
 * @param {Object}   destination Destination Stop
 * @param {Function} callback    Callback function(err, favorites)
 */
function addTrip(agencyId, origin, destination, callback) {

    // Get Current favorites
    _getLocalFavorites(agencyId, function(favorites) {

        // Add Trip to favorites list
        favorites.push({
            type: 2,
            sequence: favorites.length > 0 ? favorites[favorites.length-1].sequence + 1 : 1,
            origin: {
                id: origin.id,
                name: origin.name
            },
            destination: {
                id: destination.id,
                name: destination.name
            },
            options: {}
        });

        // Update the favorites
        _update(agencyId, favorites, function(err, updatedFavorites) {
            if ( err ) {
                return callback(err);
            }
            return callback(null, _parseFavorites(updatedFavorites));
        });

    });

}


/**
 * Remove the speicied Stops as a Favorite Trip
 * @param  {string}   agencyId    Agency ID code
 * @param  {Object}   origin      Origin Stop
 * @param  {Object}   destination Destination Stop
 * @param  {Function} callback    Callback function(err, favorites)
 */
function removeTrip(agencyId, origin, destination, callback) {
    
    // Get Current favorites
    _getLocalFavorites(agencyId, function(favorites) {

        // List of favorites to keep
        let keep = [];

        // Parse existing favorites
        for ( let i = 0; i < favorites.length; i++ ) {
            if ( favorites[i].type !== 2 || 
                (favorites[i].type === 2 && (favorites[i].origin.id !== origin.id || favorites[i].destination.id !== destination.id)) ) {
                keep.push(favorites[i]);
            }
        }

        // Update the favorites
        _update(agencyId, keep, function(err, updatedFavorites) {
            if ( err ) {
                return callback(err);
            }
            return callback(null, _parseFavorites(updatedFavorites));
        });

    });

}


/**
 * Replace the User's favorites for the specified agency
 * @param  {String}   agencyId  Agency ID code
 * @param  {Array}    favorites List of favorites to replace
 * @param  {Function} callback  Callback function(err, favorites)
 */
function update(agencyId, favorites, callback) {
    _update(agencyId, favorites, callback);
}


/**
 * Clear all locally cached favorites
 */
function clear() {
    store.delFavorites();
}




// ==== UTILITY FUNCTIONS ==== //


/**
 * Update the User's favorites.
 * - Replace local favorites
 * - Replace server favorites
 * @param  {String}   agencyId  Agency ID code
 * @param  {Array}    favorites List of favorites to replace
 * @param  {Function} callback  Callback function(err, favorites)
 */
function _update(agencyId, favorites, callback) {

    // UPDATE SEQUENCES
    for ( let i = 0; i < favorites.length; i++ ) {
        favorites[i].sequence = i+1;
    }

    // UPDATE LOCAL FAVORITES
    let local = {
        agency: agencyId,
        lastModified: _toHTTPTimestamp(),
        favorites: favorites
    }
    _saveLocalFavorites(agencyId, local, function(err) {
        if ( err ) {
            return callback(err);
        }

        // UPDATE SERVER FAVORITES
        _saveServerFavorites(agencyId, favorites, function(err, serverFavorites) {
            if ( err ) {
                return callback(err);
            }
            return callback(null, serverFavorites);
        });
    });
    
}

/**
 * Save Favorites to API Server
 * @param  {string}   agencyId  Agency ID Code
 * @param  {Array}    favorites List of favorites
 * @param  {Function} callback  Callback function(err, favorites)
 */
function _saveServerFavorites(agencyId, favorites, callback) {
    
    // Check if User is Logged In
    user.isLoggedIn(function(isLoggedIn, userInfo) {
        if ( !isLoggedIn ) {
            return callback(null, favorites);
        }

        // Send Favorites to Server
        api.post("/favorites/" + agencyId + "/" + userInfo.id, {favorites: favorites}, function(err, response) {
            if ( err ) {
                return callback(err);
            }
            _saveLocalFavorites(agencyId, response);
            return callback(null, response.favorites);
        });
    });

}



/**
 * Save Favorites to Local Cache
 * @param  {string}   agencyId  Favorites agency id
 * @param  {Object}   favorites Favorites API Response (agency, lastModified, favorites)
 * @param  {Function} callback  Callback function(err)
 */
function _saveLocalFavorites(agencyId, favorites, callback) {
    store.put("favorites-" + agencyId, favorites, callback);
}

/**
 * Get Favorites from Local Cache
 * @param  {string}   agencyId Favorites agency id
 * @param  {Function} callback Callback function(favorites)
 */
function _getLocalFavorites(agencyId, callback) {
    store.get("favorites-" + agencyId, function(err, value) {
        if ( err || value === undefined ) {
            return callback([]);
        }
        return callback(value.favorites);
    });
}

/**
 * Get the last check timestamp of the specified 
 * agency's favorites
 * @param  {string}   agencyId Agency ID Code
 * @param  {Function} callback Callback function(timestamp)
 */
function _getLastCheck(agencyId, callback) {
    store.get("favorites-checked-" + agencyId, function(err, value) {
        if ( err || value === undefined ) {
            return callback(0);
        }
        return callback(value);
    });
}

/**
 * Update the last check timestamp of the specified
 * agency's favorites
 * @param  {string}   agencyId Agency ID Code
 * @param  {Function} callback Callacbk function(err)
 */
function _updateLastCheck(agencyId, callback) {
    store.put("favorites-checked-" + agencyId, new Date().getTime());
}

/**
 * Get the last modified Date of the specified 
 * agency's favorites
 * @param  {string}   agencyId Agency ID code
 * @param  {Function} callback Callback function(Date)
 */
function _getLastModified(agencyId, callback) {
    store.get("favorites-" + agencyId, function(err, value) {
        if ( err || value === undefined ) {
            return callback(new Date(0));
        }
        return callback(new Date(value.lastModified));
    });
}

/**
 * Convert the JS Date to an HTTP Timestamp
 * @param  {Date} date JS Date
 * @return {String}    HTTP Timestamp
 */
function _toHTTPTimestamp(date) {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if ( !date ) {
        date = new Date();
    }
    
    let dow = weekdays[date.getDay()];
    let mon = months[date.getMonth()];
    let tz = "GMT" + date.toString().split("GMT")[1].split(" (")[0]

    let rtn = dow + " " + mon + " " + date.getDate() + " " + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " " + tz;

    return rtn;
}




module.exports = {
    get: get,
    addStation: addStation,
    addTrip: addTrip,
    removeStation: removeStation,
    removeTrip: removeTrip,
    clear: clear,
    update: update
}