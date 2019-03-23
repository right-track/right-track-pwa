
// Import server and local config files
const server = require("../../config.json");
let local = {}
try {
    local = require("../../config.local.json");
}
catch (e){}


// Set the config to the merged files
let config = _mergeJSON(server, local);


/**
 * Merge the additional object into the target object
 * @param  {Object} target Target Object
 * @param  {Object} add Additional Object
 */
function _mergeJSON(target, add) {
    function isObject(obj) {
        if (typeof obj == "object") {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return true; // search for first object prop
                }
            }
        }
        return false;
    }
    for (var key in add) {
        if (add.hasOwnProperty(key)) {
            if (target[key] && isObject(target[key]) && isObject(add[key])) {
                _mergeJSON(target[key], add[key]);
            } else {
                target[key] = add[key];
            }
        }
    }
    return target;
};


// Export the Merged Config
module.exports = config;
