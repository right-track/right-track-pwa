const RightTrackAgency = require("right-track-core/modules/classes/RightTrackAgency");
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
            let index = i;
            response.agencies[index].icon = "";
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
            let index = i;
            if ( agencies[index].id.toLowerCase() === agency.toLowerCase() ) {
                
                // Return matching RightTrackAgency
                let config = agencies[index].config;
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
 * Get the center of the shapes of the specified agency
 * - Cache Length: 7 days
 * @param {string} agency Agency ID Code
 * @param {Function} callback Callback function(err, center)
 */
getAgencyMapCenter = function(agency, callback) {
    _getCacheElseFresh("/maps/center/" + agency, 7*24*60*60, function(err, response) {
        return callback(err, response);
    });
}


/**
 * Get the GeoJSON shapes of the specified agency
 * - Cache Length: 7 days
 * @param {string} agency Agency ID Code
 * @param {Function} callback Callback function(err, shapes)
 */
getAgencyMapShapes = function(agency, callback) {
    _getCacheElseFresh("/maps/shapes/" + agency, 7*24*60*60, function(err, response) {
        return callback(err, response);
    });
}


/**
 * Get the GeoJSON stops of the specified agency
 * - Cache Length: 7 days
 * @param {string} agency Agency ID Code
 * @param {Function} callback Callback function(err, stops)
 */
 getAgencyMapStops = function(agency, callback) {
    _getCacheElseFresh("/maps/stops/" + agency, 7*24*60*60, function(err, response) {
        return callback(err, response);
    });
}


/**
 * Get the Station Feed for the specified stop
 * - Cache Length: 45 seconds / max 2 hours
 * @param  {string}   agencyId Agency ID code
 * @param  {string}   stopId   Stop ID
 * @param  {Function} callback Callback function(err, feed)
 */
getStationFeed = function(agencyId, stopId, callback) {
    _getCacheElseFresh("/stops/" + agencyId + "/" + stopId + "/feed", 45, 2*60*60, function(err, response) {
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
 * Get the list of supported Transit Agencies
 * @param  {Function} callback Callback function(err, transitAgencies)
 */
getTransitAgencies = function(callback) {
    let transitAgencies = [];
    let count = 0;
    let max = 0;

    // Get Transit Agencies
    _getCacheElseFresh("/transit", 7*24*60*60, function(err, response) {
        if ( err ) {
            return callback(err);
        }

        // Set Transit Agencies
        transitAgencies = response.transitAgencies;
        count = 0;
        max = transitAgencies.length;

        // Set Transit Agency Icons
        for ( let i = 0; i < transitAgencies.length; i++ ) {
            getTransitAgencyIcon(transitAgencies[i].id, function(err, response) {
                transitAgencies[i].icon = response ? "data:image/png;base64, " + response : config.api.host + "/transit/" + transitAgencies[i].id + "/icon";
                _finish();
            });
        }
    });


    /**
     * Finish setting the transit agency icon
     * - return to callback when all complete
     * @return {[type]} [description]
     */
    function _finish() {
        count++;
        if ( count === max ) {
            return callback(null, transitAgencies);
        }
    }
}


/**
 * Get the specified transit agency icon (as base64 encoded data)
 * - Cache Length: 7 days
 * @param  {string}   transitAgency Transit Agency ID Code
 * @param  {Function} callback      Callback function(err, icon)
 */
getTransitAgencyIcon = function(transitAgency, callback) {
    _getCacheElseFresh("/transit/" + transitAgency + "/icon", 7*24*60*60, true, function(err, response) {
        if ( err ) {
            return callback(err);
        }
        return callback(null, response);
    });
}


/**
 * Get the icon for the specified transit division (as base64 encoded data)
 * - Cache Length: 7 days
 * @param  {string}   transitAgency   Transit Agency ID Code
 * @param  {string}   transitDivision Transit Division Code
 * @param  {Function} callback        Callback function(err, icon)
 */
getTransitDivisionIcon = function(transitAgency, transitDivision, callback) {
    _getCacheElseFresh("/transit/" + transitAgency + "/" + transitDivision + "/icon", 7*24*60*60, true, function(err, response) {
        if ( err ) {
            return callback(err);
        }
        return callback(null, response);
    });
}


/**
 * Get the Transit Feed for the specified Transit Agency
 * - Cache Length: 5 minutes / max 2 hours
 * @param  {string}   transitAgencyId Transit Agency ID Code
 * @param  {Function} callback        Callback function(err, feed, transitAgency)
 */
getTransitFeed = function(transitAgencyId, callback) {
    let feed = undefined;
    let transitAgency = undefined;
    let count = 0;
    let max = 0;

    // Get the Transit Feed
    _getCacheElseFresh("/transit/" + transitAgencyId, 300, 2*60*60, function(err, response) {
        if ( err ) {
            return callback(err);
        }

        // Set Transit Feed and Transit Agency
        feed = response.feed;
        transitAgency = response.transitAgency;
        count = 0;
        max = feed.divisions.length;

        // Set Transit Division Icons
        for ( let i = 0; i < feed.divisions.length; i++ ) {

            // Get Transit Division Icon
            getTransitDivisionIcon(transitAgencyId, feed.divisions[i].code, function(err, response) {
                feed.divisions[i].icon = response ? "data:image/png;base64, " + response : config.api.host + "/transit/" + transitAgencyId + "/" + feed.divisions[i].code + "/icon";
                _finish();
            });

        }
    });

    /**
     * Finish setting the transit Division icon
     * - return to callback when all transit division icons have been set
     */
    function _finish() {
        count++;
        if ( count === max ) {
            return callback(null, feed, transitAgency);
        }
    }
}


/**
 * Get the API Server Messages for the client, optionally filtered by 
 * the agency
 * - Cache Length: 5 minutes
 * @param  {string}   [agency]  Agency ID Code
 * @param  {Function} callback  Callback function(err, messages)
 */
getMessages = function(agency, callback) {
    if ( callback === undefined && typeof(agency) === 'function' ) {
        callback = agency;
        agency = undefined;
    }

    // Set Messages Path
    let path = "/updates/messages?client=" + config.api.clientId;
    if ( agency ) {
        path += "&agency=" + agency;
    }

    // Get Messages
    _getCacheElseFresh(path, 300, function(err, response) {
        if ( err ) {
            return callback(err);
        }
        return callback(null, response.messages);
    });
}


/**
 * Check for an app update
 * @param  {Function} callback Callback function(err, updateAvailable, installedVersion, availableVersion, availableHash)
 */
checkAppUpdate = function(callback) {

    // Set path with current host
    let path = "/updates/apps/" 
        + encodeURIComponent(window.location.protocol + '//' + window.location.host);

    // Get update info
    _getCacheElseFresh(path, 86400, function(err, info) {
        if ( err ) {
            return callback(err);
        }
        
        // Compare to installed info
        let updateAvailable = false;
        if ( info && info.version ) {
            updateAvailable = parseInt(info.version) > parseInt(__VERSION__);
            return callback(null, updateAvailable, __VERSION__, parseInt(info.version), info.hash);
        }
        
        return callback(null, false);
    });
}


/**
 * Get API data (cache first, then network)
 * - return cached data, if present
 * - return network data, when no cached data is present
 * - fallback to cached data, if network error
 * @param  {string} path API Path
 * @param  {number} expiry Length of time to keep cached data (seconds)
 * @param  {number} [max] Maximum length of time use cached data (seconds)
 * @param  {boolean} [binary] Flag for binary data (images, etc)
 * @param  {Function} callback Callback function(err, data)
 */
function _getCacheElseFresh(path, expiry, max, binary, callback) {

    // path, expiry, callback
    if ( callback === undefined && binary === undefined && max instanceof Function ) {
        callback = max;
        max = undefined;
        binary = false;
    }

    // path, expiry, binary, callback
    if ( callback === undefined && binary instanceof Function && typeof max === 'boolean' ) {
        callback = binary;
        binary = max;
        max = undefined;
    }

    // path, expiry, max, callback
    if ( callback === undefined && binary instanceof Function && !isNaN(max) ) {
        callback = binary;
        binary = false;
    }

    // Check for cached data
    _getCache(path, expiry, max, function(cached, expired) {

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
                        console.log("getCacheElseFresh ERROR: " + err);
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
 * @param  {number} max Maximum length of time to use cached data (seconds)
 * @param  {Function} callback Callback function(cached, expired)
 */
function _getCache(path, expiry, max, callback) {
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
                    let cutoff_max = cached.saved + (max * 1000);
                    
                    // Cached data is past max age, ignore cache
                    if ( Date.now() > cutoff_max ) {
                        return callback(null);
                    }

                    // Return cached data, flag if expired
                    else {
                        let cutoff = cached.saved + (expiry * 1000);
                        let expired = Date.now() > cutoff;
                        return callback(cached.response, expired);
                    }
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


/**
 * Clear all cached data (including service worker caches)
 * @param  {Function} [callback] Callback function(success)
 */
function clear(callback) {
    caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
            console.log("...deleting cache: " + cacheName);
            caches.delete(cacheName);
        });
        if ( callback ) return callback(true);
    });
}



module.exports = {
    getServerInfo: getServerInfo,
    getAgencies: getAgencies,
    getAgency: getAgency,
    getAgencyIcon: getAgencyIcon,
    getAgencyMapCenter: getAgencyMapCenter,
    getAgencyMapShapes: getAgencyMapShapes,
    getAgencyMapStops: getAgencyMapStops,
    getStationFeed: getStationFeed,
    getTransitAgencies: getTransitAgencies,
    getTransitAgencyIcon: getTransitAgencyIcon,
    getTransitDivisionIcon: getTransitDivisionIcon,
    getTransitFeed: getTransitFeed,
    getMessages: getMessages,
    checkAppUpdate: checkAppUpdate,
    clear: clear
}