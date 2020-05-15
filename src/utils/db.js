const core = require("right-track-core");
const JSZip = require("jszip");
const api = require("@/utils/api.js");
const cache = require("@/utils/cache.js");
const store = require("@/utils/store.js");
const RightTrackDB = require("right-track-db-sqljs")("/js/worker.sql-wasm.js");

let PREPPING_DB = false;
let PREPPING_DB_CALLBACKS = [];


/**
 * Get the RightTrackDB for the specified agency
 * @param  {string} agencyCode Agency ID Code
 * @param  {Function} callback Callback function(err, database, update)
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

        // Get Database Data
        _getDBData(agencyCode, function(data) {

            // Use Cached Data...
            if ( data ) {

                // Build the Right Track DB
                _uInt8ArraytoDB(agencyCode, data, function(err, db) {
                    if ( err ) {
                        return _finish(err);
                    }

                    // Return the Right Track Database
                    return _finish(null, db);

                });

            }

            // No DB... Need to Update...
            else {
                return _finish(null, {get: function() {}, select: function() {}}, true);
            }
            
        });

    }

    /**
     * Prepping has finished, return db to callbacks
     * @param  {Error}    err Database Prep Error
     * @param  {Database} db  Database to return
     * @param  {boolean} [update] Database Update required
     */
    function _finish(err, db, update) {
        if ( !update ) {
            _putCache(agencyCode, db);
        }
        for ( let i = 0; i < PREPPING_DB_CALLBACKS.length; i++ ) {
            PREPPING_DB_CALLBACKS[i](err, db, update);
        }
        PREPPING_DB_CALLBACKS = [];
        PREPPING_DB = false;
    }   

}


/**
 * Download and Install the specified version (or latest) agency database
 * @param  {string}    agency     Agency ID Code
 * @param  {int}       version    Version to download and install (or latest)
 * @param  {Function}  [progress] Progress callback function(percent)
 * @param  {Function}  callback   Callback function(err, db)
 */
function update(agency, version, progress, callback) {

    // Parse Arguments
    if ( callback === undefined && typeof progress === 'function' ) {
        callback = progress;
        progress = function() {};
    }
    
    // Download Archive
    if ( version ) {
        api.download("/updates/database/archive/" + agency + "?download=" + version + "&zip", progress, function(err, zipped) {
            _continue(err, zipped)
        });
    }
    
    // Download Latest
    else {
        api.download("/updates/database/" + agency + "?download=latest&zip", progress, function(err, zipped) {
            _continue(err, zipped)
        });
    }

    // Install the zipped Database
    function _continue(err, zipped) {
        if ( err ) {
            return callback(err);
        }

        // Unzip Data
        JSZip.loadAsync(zipped).then(function(zip) {
            zip.file("database.db").async("uint8array").then(function(unzipped) {
                
                // Install / Save DB Data
                _saveDBData(agency, unzipped, function() {

                    // Clear Cached Database
                    _clearCache();

                    // Build Right Track DB
                    _uInt8ArraytoDB(agency, unzipped, function(err, db) {
                        if ( err ) {
                            return callback(err);
                        }

                        // Save the current database version
                        _saveDatabaseVersion(agency, db, function(err) {
                            if ( err ) {
                                return callback(err);
                            }

                            // RETURN THE DATABASE
                            return callback(null, db);

                        });

                    });

                });
            });
        });
    }
}



/**
 * Convert uInt8Array to Right Track Database
 * @param  {string}   agency   Agency ID Code
 * @param  {int[]}    data     uInt8Array encoded data of the DB
 * @param  {function} callback Callback function(err, db)
 */
function _uInt8ArraytoDB(agency, data, callback) {

    // Get the Agency Config
    cache.getAgency(agency, function(err, rta) {
        if ( err ) {
            return callback(err);
        }
        let config = rta.getConfig();

        // Build the Right Track Database
        let db = new RightTrackDB(config, data);

        // Make test DB query
        db.get("SELECT * FROM rt_about;", function(err, info) {
            if ( err ) {
                return callback(err);
            }
            return callback(null, db);
        });
    });
    
}


/**
 * Set the stored DB Version to that of the provided DB
 * @param  {string}     agency  Agency ID Code
 * @param  {RightTrackDB}   db  Current Database
 * @param  {Function} callback  Callback function(err)
 */
function _saveDatabaseVersion(agency, db, callback) {
    core.query.about.getAbout(db, function(err, about) {
        if ( err ) {
            return callback(err)
        }
        else if ( !about ) {
            return callback(new Error("Could not get database version"));
        }
        else {
            _saveDBVersionStored(agency, about.version, function() {
                return callback();
            });
        }
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
 * @param  {Function} callback Callback function(data)
 */
function _getDBData(agency, callback) {
    store.get("db-data-" + agency, function(err, data) {
        return callback(data);
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


/**
 * Clear all stored and cached database information for the specified agency
 * @param  {string}   agency     Agency ID Code
 * @param  {Function} [callback] Callback function()
 */
function clear(agency, callback) {
    _clearCache();
    store.del("db-version-stored-" + agency, function(err) {
        store.del("db-data-" + agency, function(err) {
            store.del("db-version-latest-" + agency, function() {
                store.del("db-version-latest-checked-" + agency, function() {
                    if ( callback ) return callback();
                });
            });
        });
    });
}


module.exports = {
    getDB: getDB,
    isReady: isReady,
    getDBVersion: getDBVersion,
    setDBVersion: setDBVersion,
    update: update,
    clear: clear
}