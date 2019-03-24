const RightTrackDB = require("right-track-db-sqljs")("/js/worker.sql.js");
const cache = require("./cache.js");


/**
 * Get the RightTrackDB for the specified agency
 * @param  {string} agencyCode Agency ID Code
 * @param  {Function} callback Callback function(err, database)
 */
getDB = function(agencyCode, callback) {

    // Check cache for database
    let cacheDB = _getCache(agencyCode);
    if ( cacheDB !== undefined ) {
        return callback(null, cacheDB);
    }

    // Get Right Track Agency
    cache.getAgency(agencyCode, function(err, agency) {
        if ( err ) {
            return callback(err);
        }

        // Set Agency Config
        let agencyConfig = agency.getConfig();

        // Get Database Data
        cache.getAgencyDB(agencyCode, function(err, data) {
            if ( err ) {
                return callback(err);
            }

            // Convert Base64 to Binary Int Array
            let raw = window.atob(data);
            let rawLength = raw.length;
            let array = new Uint8Array(new ArrayBuffer(rawLength));
            for( let i = 0; i < rawLength; i++ ) {
                array[i] = raw.charCodeAt(i);
            }

            // Build the Right Track Database
            let db = new RightTrackDB(agencyConfig, array);

            // Save the DB in cache
            _putCache(agencyCode, db);

            // Return the Right Track Database
            return callback(null, db);
        });
    });

}


/**
 * Check if the Right Track Database for the specified agency 
 * is open and loaded in the brower cache
 * @param  {string}  agency Agency ID Code
 * @return {Boolean}        True if agency db is ready to be used
 */
function isReady(agency) {
    return _getCache(agency) !== undefined;
}


/**
 * Get the cached database
 * @param  {string} agency Agency ID Code
 */
function _getCache(agency) {
    if ( window.DB !== undefined ) {
        if ( window.DB[agency] !== undefined ) {
            return window.DB[agency];
        }
    }
    return undefined;
}

/**
 * Put the database in the cache
 * @param  {string} agency Agency ID Code
 * @param  {Object} database Right Track DB
 */
function _putCache(agency, database) {
    if ( window.DB === undefined ) {
        window.DB = {};
    }
    window.DB[agency] = database;
}


module.exports = {
    getDB: getDB,
    isReady: isReady
}