const RightTrackAgency = require("right-track-agency");
const config = require("@/utils/config.js");
const api = require("@/utils/api.js");

const API_CACHE = "rtapi-cache-" + config.api.host;


/**
 * Get the API Server info (cache first, then network)
 * - Cache Length: 7 days
 * @param  {Function} callback Callback function(err, server info)
 */
getServerInfo = function(callback) {
    _getCacheElseFresh("/about", 7*24*60*60, function(err, response) {
        if ( err ) {
            return callback(err, {});
        }

        // Add URL to server
        response.server.url = "https://" + response.server.host;

        return callback(null, response.server);
    });
}


/**
 * Get the supported agencies (cache first, then network)
 * - Cache Length: 7 days
 * @param  {Function} callback Callback function(err, agencies)
 */
getAgencies = function(callback) {
    _getCacheElseFresh("/about/agencies?agencyConfig=true", 7*24*60*60, function(err, response) {
        if ( err ) {
            return callback(err, []);
        }

        // Add Icon URL
        for ( i in response.agencies ) {
            response.agencies[i].icon = "";
        }

        return callback(null, response.agencies);
    });
}


/**
 * Get a RightTrackAgency representation of the specified agency
 * @param  {string} agency Agency ID Code
 * @param  {Function} callback Callback function(err, RightTrackAgency)
 */
getAgency = function(agency, callback) {
    
    // Get Agency Information
    getAgencies(function(err, agencies) {
        if ( err ) {
            return callback(err);
        }

        // Find Matching Agency
        for ( i in agencies ) {
            if ( agencies[i].id.toLowerCase() === agency.toLowerCase() ) {
                
                // Return matching RightTrackAgency
                let config = agencies[i].config;
                return callback(null, new RightTrackAgency(config));

            }
        }

        // No matching agency
        return callback(new Error("Could not find matching agency data"));

    });

}


/**
 * Get the specified agency icon (as base64 encoded data)
 * - Cache Length: 7 days
 * @param  {string} agency Agency ID Code
 * @param  {Function} callback Callback function(err, icon)
 */
getAgencyIcon = function(agency, callback) {
    _getCacheElseFresh("/about/agencies/" + agency + "/icon", 7*24*60*60, true, function(err, response) {
        if ( err ) {
            return callback(err);
        }
        return callback(null, response);
    });
}


/**
 * Get the Station Feed for the specified stop
 * - Cache Length: 45 seconds
 * @param  {string}   agencyId Agency ID code
 * @param  {string}   stopId   Stop ID
 * @param  {Function} callback Callback function(err, feed)
 */
getStationFeed = function(agencyId, stopId, callback) {
    _getCacheElseFresh("/stops/" + agencyId + "/" + stopId + "/feed", 45, function(err, response) {
        if ( err ) {
            return callback(err);
        }
        else if ( response.feed === undefined || response.feed.departures === undefined ) {
            return callback(new Error("Station Feed has no departures."));
        }

        // Add undefined trips
        for ( let i = 0; i < response.feed.departures.length; i++ ) {
            if ( response.feed.departures[i].trip === undefined ) {
                response.feed.departures[i].trip = {};
            }
            if ( response.feed.departures[i].trip.route === undefined ) {
                response.feed.departures[i].trip.route = {
                    color: 'eaeaea',
                    textColor: '000000'
                }
            }
        }

        return callback(null, response.feed);
    });
}


/**
 * Get the Transit Feed for the specified Transit Agency
 * - Cache Length: 5 minutes
 * @param  {string}   transitAgencyId Transit Agency ID Code
 * @param  {Function} callback        Callback function(err, feed, transitAgency)
 */
getTransitFeed = function(transitAgencyId, callback) {
    _getCacheElseFresh("/transit/" + transitAgencyId, 300, function(err, response) {
        if ( err ) {
            return callback(err);
        }
        return callback(null, response.feed, response.transitAgency);
    });
}


/**
 * Get API data (cache first, then network)
 * - return cached data, if present
 * - return network data, when no cached data is present
 * - fallback to cached data, if network error
 * @param  {string} path API Path
 * @param  {number} expiry Length of time to keep cached data (seconds)
 * @param  {boolean} [binary] Flag for binary data (images, etc)
 * @param  {Function} callback Callback function(err, data)
 */
function _getCacheElseFresh(path, expiry, binary, callback) {

    // Parse arguments
    if ( callback === undefined && binary instanceof Function ) {
        callback = binary;
        binary = false;
    }

    // Check for cached data
    _getCache(path, expiry, function(cached, expired) {

        // Use cached data...
        if ( cached && !expired ) {
            return callback(null, cached);
        }

        // Use fresh data...
        else {

            // Request fresh data
            api.get(path, binary, function(err, fresh) {

                // Fresh data error...
                if ( err ) {

                    // Returned cached, if provided
                    if ( cached ) {
                        return callback(null, cached);
                    }

                    // Return with error
                    else {
                        return callback(err);
                    }
                    
                }

                // Fresh data retrieved...
                else {

                    // Cache the fresh response
                    _putCache(path, fresh, function() {

                        // Return with the fresh response
                        return callback(null, fresh)

                    });

                }

            });

        }

    });

}


/**
 * Get cached data for the specified API Path
 * - returns parsed data, if JSON
 * - returns null, if no cached data present
 * @param  {string} path API Path
 * @param  {number} expiry Length of time to keep cached data (seconds)
 * @param  {Function} callback Callback function(cached, expired)
 */
function _getCache(path, expiry, callback) {
    let key = path.includes("http") ? path : config.api.host + path;
    key = key.replace(/\?*&*t=[0-9]+$/g, "");

    // Get the RT API Cache
    caches.open(API_CACHE).then(function(cache) {

        // Check for matching request
        cache.match(key).then(function(response) {

            // Cache match found...
            if ( response ) {
                response.text().then(function(cacheText) {
                    let cached = JSON.parse(cacheText);
                    let cutoff = cached.saved + (expiry * 1000);
                    let expired = Date.now() > cutoff;
                    return callback(cached.response, expired);
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
 * Save the API response to the cache
 * - JSON data is stringified
 * @param  {string} path API Path
 * @param  {Object} response Response data to cache
 * @param  {Function} callback Callback function()
 */
function _putCache(path, response, callback) {
    let key = path.includes("http") ? path : config.api.host + path;
    key = key.replace(/\?*&*t=[0-9]+$/g, "");

    // Get the RT API Cache
    caches.open(API_CACHE).then(function(cache) {

        // Build Cache Body
        let cacheBody = {
            "saved": Date.now(),
            "response": response
        }

        // Create Blob for Response
        let blob = new Blob([JSON.stringify(cacheBody)], {type: 'application/json'});

        // Build a Response to put in the cache
        let cacheResponse = new Response(blob, {status: 200});

        // Add Response to cache
        cache.put(key, cacheResponse);

        // Return
        return callback();

    });

}



module.exports = {
    getServerInfo: getServerInfo,
    getAgencies: getAgencies,
    getAgency: getAgency,
    getAgencyIcon: getAgencyIcon,
    getStationFeed: getStationFeed,
    getTransitFeed: getTransitFeed
}