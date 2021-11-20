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
 * @param {string[]} divisionCodes Transit Division Codes
 * @param {Function} callback Callback function(err, division)
 */
function getFeedDivision(transitAgency, divisionCodes, callback) {
    getFeed(transitAgency, function(err, feed) {
        if ( err ) {
            return callback(err);
        }
        if ( feed && feed.divisions && divisionCodes ) {
            let divs = feed.divisions;
            for ( let i = 0; i < divisionCodes.length; i++ ) {
                for ( let j = 0; j < divs.length; j++ ) {
                    if ( divs[j].code === divisionCodes[i] ) {
                        if ( i === divisionCodes.length-1 ) {
                            return callback(err, divs[j])
                        }
                        divs = divs[j].divisions;
                        break;
                    }
                }
            }
        }
        return callback();
    });
}

/**
 * Get the information about the specified Transit Agency
 * @param  {string}   transitAgency Transit Agency ID Code
 * @param  {Function} callback      Callback function(err, info)
 */
function getTransitAgencyInformation(transitAgency, callback) {
    getFeed(transitAgency, function(err, feed, info) {
        if ( err ) {
            return callback(err);
        }
        return callback(null, info);
    });
}


module.exports = {
    getFeed: getFeed,
    getFeedDivision: getFeedDivision,
    getTransitAgencyInformation: getTransitAgencyInformation
}