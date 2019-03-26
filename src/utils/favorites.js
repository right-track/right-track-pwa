const user = require("@/utils/user.js");
const cache = require("@/utils/cache.js");
const store = require("@/utils/store.js");


/**
 * Get the Favorites for the specified agency.  If a User is 
 * logged in, then get the Favorites from the API Server, otherwise 
 * get the locally saved favorites.
 * @param  {string}   agencyId Favorites agency id
 * @param  {Function} callback Callback function(err, favorites)
 */
function getFavorites(agencyId, callback) {

    // Check if user is logged in
    user.isLoggedIn(function(isLoggedIn, userInfo) {

        // IS LOGGED IN - get server favorites
        if ( isLoggedIn ) {

            // Get favorites from the server / server cache
            cache.getFavorites(agencyId, userInfo.id, function(err, response) {
                if ( err ) {
                    _getLocalFavorites(agencyId, function(cache) {
                        return _return(cache.favorites);
                    });
                }

                // Return the server favorites
                _saveLocalFavorites(agencyId, response);
                return _return(response.favorites);

            });

        }

        // IS NOT LOGGED IN - get local favorites
        else {
            _getLocalFavorites(agencyId, function(cache) {
                return _return(cache.favorites)
            });
        }

    });


    /**
     * Add Icon and Label to each favorites, then return to callback
     * @param  {Array} favorites List of favorites to return
     */
    function _return(favorites) {
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
            return callback(null, favorites);
        }
        else {
            return callback(null, []);
        }
    }

}




/**
 * Save Favorites to Local Cache
 * @param  {string}   agencyId  Favorites agency id
 * @param  {Array}    favorites List of favorites to save
 * @param  {Function} callback  Callback function()
 */
function _saveLocalFavorites(agencyId, favorites, callback) {
    store.put(agencyId + "-favorites", favorites, callback);
}

/**
 * Get Favorites from Local Cache
 * @param  {string}   agencyId Favorites agency id
 * @param  {Function} callback Callback function(favorites)
 */
function _getLocalFavorites(agencyId, callback) {
    store.get(agencyId + "-favorites", function(err, value) {
        if ( err ) {
            return callback([]);
        }
        return callback(value.favorites);
    });
}



module.exports = {
    getFavorites: getFavorites
}