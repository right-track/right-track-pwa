const cache = require("@/utils/cache.js");
const store = require("@/utils/store.js");

const key_prefix = "message-dismissed";


/**
 * Get Server Messages
 * @param  {string}   [agency] Agency ID Code
 * @param  {Function} callback Callback function(err, messages)
 */
function getMessages(agency, callback) {
    if ( callback === undefined && typeof(agency) === 'function' ) {
        callback = agency;
        agency = undefined;
    }
    let count = 0;
    let max = 0;
    let rtn = [];
    let err = undefined;

    // Get Messages from the Cache
    cache.getMessages(agency, function(err, messages) {
        if ( err ) {
            return callback(err);
        }
        max = messages.length;
        if ( max === 0 ) return _finish();

        // Check for dismissed messages
        for ( let i = 0; i < messages.length; i++ ) {
            isDismissed(messages[i].id, function(err, dismissed) {
                _finish(err, messages[i], dismissed)
            });
        }
    });

    // Add non-dismissed and enabled messages
    // Return to the main callback when complete
    function _finish(_err, message, dismissed) {
        if ( _err ) err = _err;
        count++;
        if ( message && message.enabled && !dismissed ) rtn.push(message);
        if ( count >= max ) return callback(err, rtn);
    }
}


/**
 * Set the specified Message as dismissed
 * @param  {int}      id         Message ID
 * @param  {Function} [callback] Callback function(err)
 */
function dismissMessage(id, callback) {
    let key = key_prefix + "-" + id;
    store.put(key, 'dismissed', callback);
}


/**
 * Check if the specified message has been dismissed
 * @param  {int}      id       Message ID
 * @param  {Function} callback Callback function(err, dismissed)
 */
function isDismissed(id, callback) {
    let key = key_prefix + "-" + id;
    store.get(key, function(err, value) {
        return callback(err, value === 'dismissed');
    });
}


module.exports = {
    getMessages: getMessages,
    dismissMessage: dismissMessage
}