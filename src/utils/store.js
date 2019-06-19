const DB_NAME = "right-track";
const DB_VERSION = 2;
const DB_STORE = "right-track-store";
let DB_SUPPORT = false;

// Check for IndexedDB Support
if ( window.indexedDB ) {
    DB_SUPPORT = true;
}
else {
    console.error("Indexed DB not supported in this browser!");
}


/**
 * Open the Database
 * @param  {Function} callback Callback function(err, database)
 */
function _open(callback) {
    if ( !DB_SUPPORT ) {
        return callback(new Error("IndexedDB not supported"));
    }

    let request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = function() {
        return callback(null, request.result);
    }
    request.onerror = function() {
        return callback(request.error);
    }
    request.onupgradeneeded = function() {
        let db = request.result;
        let store = db.createObjectStore(DB_STORE);
    }
}

/**
 * Add a value to the database using the specified key
 * @param {String}   key        DB Key
 * @param {Object}   value      DB Value
 * @param {Function} [callback] Callback function(err)
 */
function put(key, value, callback) {
    _open(function(err, db) {
        if ( err ) {
            if ( callback ) return callback(err);
            return;
        }
        
        // Get DB Transaction
        let transaction = db.transaction(DB_STORE, 'readwrite');
        transaction.onabort = function() {
            if ( callback ) return callback(new Error("DB PUT Transaction Aborted (key: " + key + ")"));
        }
        transaction.onerror = function() {
            if ( callback ) return callback(new Error("DB PUT Transaction Error (key: " + key + ")"));
        }
        transaction.oncomplete = function() {
            if ( callback ) return callback();
        }

        // Get DB Store
        let store = transaction.objectStore(DB_STORE);

        // Add Data to DB Store
        store.put(value, key);
    });
}


/**
 * Get a value from the database using the specified key
 * @param  {String}   key      DB Key
 * @param  {Function} callback Callback function(err, value)
 */
function get(key, callback) {
    _open(function(err, db) {
        if ( err ) {
            return callback(err);
        }
        
        // Get DB Transaction
        let transaction = db.transaction(DB_STORE, 'readwrite');
        transaction.onabort = function() {
            if ( callback ) return callback(new Error("DB GET Transaction Aborted (" + key + ")"));
        }
        transaction.onerror = function() {
            if ( callback ) return callback(new Error("DB GET Transaction Error (" + key + ")"));
        }

        // Get DB Store
        let store = transaction.objectStore(DB_STORE);

        // Get Data from DB Store
        let request = store.get(key);
        
        // Return data via callback
        request.onsuccess = function() {
            return callback(null, request.result);
        }

    });
}


/**
 * Remove a value from the database using the specified key
 * @param  {String}   key      DB Key
 * @param  {Function} callback Callback function(err)
 */
function del(key, callback) {
    _open(function(err, db) {
        if ( err ) {
            return callback(err);
        }
        
        // Get DB Transaction
        let transaction = db.transaction(DB_STORE, 'readwrite');
        transaction.onabort = function() {
            if ( callback ) return callback(new Error("DB DEL Transaction Aborted (" + key + ")"));
        }
        transaction.onerror = function() {
            if ( callback ) return callback(new Error("DB DEL Transaction Error (" + key + ")"));
        }

        // Get DB Store
        let store = transaction.objectStore(DB_STORE);

        // Remove Data from DB Store
        let request = store.delete(key);
        
        // Return data via callback
        request.onsuccess = function() {
            if ( callback ) return callback(null);
        }

    });
}


/**
 * Remove all locally cached favorites
 * @param {Function} [callback] Callback function(err)
 */
function delFavorites(callback) {
    let _this = this;
    let count = 0;
    let max = 0;

    _open(function(err, db) {
        if ( err ) {
            if ( callback ) return callback(err);
        }

        else {

            // Get DB Transaction
            let transaction = db.transaction(DB_STORE, 'readwrite');
            
            // Get DB Store
            let store = transaction.objectStore(DB_STORE, 'readwrite');

            // Get All Keys
            let request = store.getAllKeys();
            request.onsuccess = function() {
                let keys = request.result;
                let favKeys = []
                
                for ( let i = 0; i < keys.length; i++ ) {
                    if ( keys[i].startsWith("favorites-") ) {
                        favKeys.push(keys[i]);
                    }
                }

                // Delete Favorite Keys
                max = favKeys.length;
                for ( let i = 0; i < favKeys.length; i++ ) {
                    _this.del(favKeys[i], function(err) {
                        if ( err ) {
                            if ( callback ) return callback(err);
                        }
                        else {
                            _finished();
                        }
                    });
                }
                if ( max === 0 ) {
                    _finished();
                }
            }

        }
    });

    /**
     * Delete callback, return to callback when all 
     * delete calls have finished
     * @return {[type]} [description]
     */
    function _finished() {
        count = count + 1;
        if ( count >= max ) {
            if ( callback ) return callback();
        }
    }
}



module.exports = {
    put: put,
    get: get,
    del: del,
    delFavorites: delFavorites
}