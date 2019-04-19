const core = require("right-track-core");
const RightTrackDB = require("right-track-db-sqljs")("/js/worker.sql.js");
const api = require("@/utils/api.js");
const cache = require("@/utils/cache.js");
const store = require("@/utils/store.js");

let PREPPING_DB = false;
let PREPPING_DB_CALLBACKS = [];


/**
 * Get the RightTrackDB for the specified agency
 * @param  {string} agencyCode Agency ID Code
 * @param  {Function} callback Callback function(err, database)
 */
getDB = function(agencyCode, callback) {

    // Add callback to list of callbacks
    PREPPING_DB_CALLBACKS.push(callback);
    
    // If not already prepping the database, start now
    if ( !PREPPING_DB ) {
        PREPPING_DB = true; 
        
        // Check cache for database
        let cacheDB = _getCache(agencyCode);
        if ( cacheDB !== undefined ) {
            return _finish(null, cacheDB);
        }

        // Get Right Track Agency
        cache.getAgency(agencyCode, function(err, agency) {
            if ( err ) {
                return _finish(err);
            }

            // Set Agency Config
            let agencyConfig = agency.getConfig();

            // Get Database Data
            _getDBData(agencyCode, function(err, data) {
                if ( err ) {
                    return _finish(err);
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

                // Save the db version
                core.query.about.getAbout(db, function(err, about) {
                    if ( about ) {
                        _saveDBVersionStored(agencyCode, about.version);
                    }

                    // Save the DB in cache
                    _putCache(agencyCode, db);

                    // Return the Right Track Database
                    return _finish(null, db);

                });

                
            });
        });

    }

    /**
     * Prepping has finished, return db to callbacks
     * @param  {Error}    err Database Prep Error
     * @param  {Database} db  Database to return
     */
    function _finish(err, db) {
        for ( let i = 0; i < PREPPING_DB_CALLBACKS.length; i++ ) {
            PREPPING_DB_CALLBACKS[i](err, db);
        }
        PREPPING_DB_CALLBACKS = [];
        PREPPING_DB = false;
    }   

}


/**
 * Download and install the latest agency database
 * @param  {string}   agency   Agency ID Code
 * @param  {Function} progress Progress callback function(percent)
 * @param  {Function} callback Callback function()
 */
function update(agency, progress, callback) {
    
    // Download
    api.download("/updates/database/" + agency + "?download=latest", progress, function(err, data) {
        if ( err ) {
            return callback(err);
        }

        // Install
        _saveDBData(agency, data, function() {

            // Clear Cache
            _clearCache();

            // Prep
            getDB(agency, function(err) {
                if ( err ) {
                    return callback(err);
                }
                return callback(null);
            });

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
 * Get version of stored agency database
 * @param  {string}   agency   Agency ID Code
 * @param  {Function} callback Callback function(version)
 */
function getDBVersion(agency, callback) {
    _getDBVersionStored(agency, callback);
}


/**
 * Set the version of the stored agency database
 * @param {string}   agency   Agency ID Code
 * @param {int}      version  DB Version
 * @param {Function} callback Callback function(err)
 */
function setDBVersion(agency, version, callback) {
    _saveDBVersionStored(agency, version, callback);
}


/**
 * Get Base64 encoded database data
 * - First, check for stored data
 * - Then, get fresh data from the api server
 * @param  {string}   agency   Agency ID Code
 * @param  {Function} callback Callback function(err, data)
 */
function _getDBData(agency, callback) {

    // Get Stored Data
    store.get("db-data-" + agency, function(err, data) {
        if ( !err && data ) {
            return callback(null, data);
        }

        // Get Fresh Data
        api.get("/updates/database/" + agency + "?download=latest", true, function(err, data) {
            if ( err ) {
                return callback(err);
            }
            _saveDBData(agency, data, function() {
                return callback(null, data);
            });
        });

    });

}

/**
 * Save the Base64 encoded database data
 * @param  {string}   agency     Agency ID Code
 * @param  {string}   data       Base64 encoded database data
 * @param  {Function} [callback] Callback function(err)
 */
function _saveDBData(agency, data, callback) {
    store.put("db-data-" + agency, data, callback);
}

/**
 * Get the version of the stored agency database
 * @param  {string}   agency   Agency ID Code
 * @param  {Function} callback Callback function(version)
 */
function _getDBVersionStored(agency, callback) {
    store.get("db-version-stored-" + agency, function(err, value) {
        if ( err || !value ) {
            return callback(undefined);
        }
        return callback(value);
    });
}

/**
 * Save the version of the stored agency database
 * @param  {string}   agency     Agency ID Code
 * @param  {int}      version    Agency Databse Version
 * @param  {Function} [callback] Callback function(err)
 */
function _saveDBVersionStored(agency, version, callback) {
    store.put("db-version-stored-" + agency, version, callback);
}


/**
 * Get the cached database
 * @param  {string} agency Agency ID Code
 */
function _getCache(agency) {
    if ( window.DB !== undefined ) {
        if ( window.DB.agency === agency ) {
            return window.DB.database;
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
    window.DB = {
        agency: agency,
        database: database
    }
}

/**
 * Clear the database in the cache
 */
function _clearCache() {
    window.DB = undefined;
}


module.exports = {
    getDB: getDB,
    isReady: isReady,
    getDBVersion: getDBVersion,
    setDBVersion: setDBVersion,
    update: update
}