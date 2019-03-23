const RightTrackDB = require("right-track-db-sqljs");
const cache = require("./cache.js");


/**
 * Get the RightTrackDB for the specified agency
 * @param  {string} agencyCode Agency ID Code
 * @param  {Function} callback Callback function(err, database)
 */
getAgencyDB = function(agencyCode, callback) {

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

            // Get SQL instance
            _getSQL(function(SQL) {

                // Build the Right Track Database
                let db = new SQL.Database(array);
                let rtdb = new RightTrackDB(agencyConfig, db);

                // Save the DB in cache
                _putCache(agencyCode, rtdb);

                // Return the Right Track Database
                return callback(null, rtdb);

            });

        });

    });

}


/**
 * Get SQL from the window object (when available)
 * @param  {Function} callback Callback function(SQL)
 * @param  {Number} [count] Count of attempts
 */
function _getSQL(callback, count=0) {
    count++;
    if ( window.SQL || count >= 6 ) {
        return callback(window.SQL);
    }
    else {
        setTimeout(function() {
            _getSQL(callback, count);
        }, 500)
    }
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
    getAgencyDB: getAgencyDB
}