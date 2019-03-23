const user = require("./user.js");
const cache = require("./cache.js");

const LOCAL_FAVORITES_CACHE = "rtfavorites-cache-local";


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
                    return callback(err);
                }

                // Return the server favorites
                return callback(null, response.favorites);

            });

        }

        // IS NOT LOGGED IN - get local favorites
        else {
            _getLocalFavorites(agencyId, function(cache) {
                return callback(null, cache.favorites)
            });
        }

    });

}




/**
 * Save Favorites to Local Cache
 * @param  {string}   agencyId  Favorites agency id
 * @param  {Array}    favorites List of favorites to save
 * @param  {Function} callback  Callback function()
 */
function _saveLocalFavorites(agencyId, favorites, callback) {
    _putCache(
        agencyId, 
        {
            agency: agencyId,
            lastModified: Date.now(),
            favorites: favorites
        },
        callback
    );
}

/**
 * Get Favorites from Local Cache
 * @param  {string}   agencyId Favorites agency id
 * @param  {Function} callback Callback function(favorites)
 */
function _getLocalFavorites(agencyId, callback) {
    _getCache(agencyId, callback);
}



/**
 * Get cached favorites for the specified agency
 * @param  {string} agency Favorites agency id
 * @param  {Function} callback Callback function(cache)
 */
function _getCache(agency, callback) {
    let key = "local/favorites/" + agency;

    // Get the RT User Cache
    caches.open(LOCAL_FAVORITES_CACHE).then(function(cache) {

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
                return callback({
                    agency: agency,
                    lastModified: undefined,
                    favorites: []
                });
            }
            
        });

    });
}


/**
 * Save the specified favorites to the cache
 * @param  {string} agency Favorites agency id
 * @param  {Object} favorites Favorites Response
 * @param  {Function} callback Callback function()
 */
function _putCache(agency, favorites, callback) {
    let key = "local/favorites/" + agency;

    // Get the RT User Cache
    caches.open(LOCAL_FAVORITES_CACHE).then(function(cache) {

        // Create Blob for Response
        let blob = new Blob([JSON.stringify(favorites)], {type: 'application/json'});

        // Build a Response to put in the cache
        let cacheResponse = new Response(blob, {status: 200});

        // Add Response to cache
        cache.put(key, cacheResponse);

        // Return
        return callback();

    });
}


/**
 * Remove the favorites of the specified agency from the cache
 * @param  {string}   agency   Favorites agency id
 * @param  {Function} callback Callback function()
 */
function _removeCache(agency, callback) {
    let key = "local/favorites/" + agency;

    // Get the RT User Cache
    caches.open(LOCAL_FAVORITES_CACHE).then(function(cache) {
        cache.delete(key).then(function() {
            return callback();
        });
    });
}



module.exports = {
    getFavorites: getFavorites
}