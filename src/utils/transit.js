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
 * Get the specified Transit Division from the Transit Feed of the 
 * specified Transit Agency
 * @param {string} transitAgency Transit Agency ID Code
 * @param {string} divisionCode Transit Division Code
 * @param {Function} callback Callback function(err, division)
 */
function getFeedDivision(transitAgency, divisionCode, callback) {
    getFeed(transitAgency, function(err, feed) {
        if ( err ) {
            return callback(err);
        }
        if ( feed && feed.divisions && Array.isArray(feed.divisions) ) {
            for ( let i = 0; i < feed.divisions.length; i++ ) {
                if ( feed.divisions[i].code === divisionCode ) {
                    return callback(null, feed.divisions[i]);
                }
            }
        }
        return callback(null, undefined);
    });
}


/**
 * Get the specified Transit Line from the Transit Feed of the 
 * specified Transit Agency and Division
 * @param {string} transitAgency Transit Agency ID Code
 * @param {string} divisionCode Transit Division Code
 * @param {string} lineCode Transit Line Code
 * @param {function} callback Callback function(err, line)
 */
function getFeedLine(transitAgency, divisionCode, lineCode, callback) {
    getFeedDivision(transitAgency, divisionCode, function(err, division) {
        if ( err ) {
            return callback(err);
        }
        if ( division && division.lines && Array.isArray(division.lines) ) {
            for ( let i = 0; i < division.lines.length; i++ ) {
                if ( division.lines[i].code === lineCode ) {
                    return callback(null, division.lines[i]);
                }
            }
        }
        return callback(null, undefined);
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
    getFeedDivision: getFeedDivision,
    getFeedLine: getFeedLine,
    getTransitAgencyInformation: getTransitAgencyInformation
}