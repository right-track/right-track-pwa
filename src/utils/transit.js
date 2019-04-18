const cache = require("@/utils/cache.js");


/**
 * Get the Transit Feed for the specified Transit Agency
 * @param  {string}   transitAgency Transit Agency ID Code
 * @param  {Function} callback      Callback function(err, feed)
 */
function getFeed(transitAgency, callback) {
    cache.getTransitFeed(transitAgency, function(err, feed) {
        if ( err ) {
            return callback(err);
        }
        return callback(null, feed);
    });
}

/**
 * Get the information about the specified Transit Agency
 * @param  {string}   transitAgency Transit Agency ID Code
 * @param  {Function} callback      Callback function(err, info)
 */
function getTransitAgencyInformation(transitAgency, callback) {
    cache.getTransitFeed(transitAgency, function(err, feed, info) {
        if ( err ) {
            return callback(err);
        }
        return callback(null, info);
    });
}


module.exports = {
    getFeed: getFeed,
    getTransitAgencyInformation: getTransitAgencyInformation
}