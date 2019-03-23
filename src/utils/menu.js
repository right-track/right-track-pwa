const config = require("./config.js");
const user = require("./user.js");

/**
 * MENU ITEM OBJECT
 * key: integer (required) = menu item index
 * type: string (required) = menu item type (item, badge, divider)
 * title: string (required for 'item') = title text
 * icon: string (required for 'item') = icon name (material design icon)
 * page: string (required for 'item') = router page name
 * query: object = object properties will be passed to router query object
 *     property values can be a compute function(vm) or the actual value 
 * params: obejct = object properties will be passed to router params object
 *     property values can be a compute function(vm) or the actual value
 */


// ==== AUTH MENU ITEMS ==== //
const LOGIN = [
    {
        key: 1,
        type: "item",
        title: "Log In",
        icon: "person_outline",
        page: "login",
        query: {
            agency: function(vm) {
                return vm.$route.query.agency;
            },
            src: function(vm) {
                return vm.$route.query.src;
            }
        }
    },
    {
        key: 2,
        type: "item",
        title: "Create Account",
        icon: "person_add",
        page: "register",
        query: {
            agency: function(vm) {
                return vm.$route.query.agency;
            },
            src: function(vm) {
                return vm.$route.query.src;
            }
        }
    },
    {
        key: 3,
        type: "divider"
    },
    {
        key: 4,
        type: "item",
        title: "Agencies",
        icon: "list",
        page: "agencies"
    },
]

// ==== NON-AGENCY MENU ITEMS ==== //
const HOME = [
    {
        key: 1,
        type: "item",
        title: "Agencies",
        icon: "list",
        page: "agencies"
    },
    {
        key: 2,
        type: "item",
        title: "Transit Alerts",
        icon: "warning",
        page: "alerts"
    },
    {
        key: 3,
        type: "divider"
    },
    {
        key: 18,
        type: "item",
        title: "About",
        icon: "info",
        page: "about"
    },
    {
        key: 4,
        type: "item",
        title: config.maintainer.name,
        icon: "person_pin",
        page: config.maintainer.website
    }
]

// ==== AGENCY MENU ITEMS ==== //
const MENU = [
    {
        key: 11,
        type: "item",
        title: "Favorites",
        icon: "star",
        page: "favorites"
    },
    {
        key: 12,
        type: "item",
        title: "Trips",
        icon: "train",
        page: "trips"
    },
    {
        key: 13,
        type: "item",
        title: "Stations",
        icon: "access_time",
        page: "stations"
    },
    {
        key: 14,
        type: "badge",
        title: "Alerts",
        icon: "error",
        page: "alerts"
    },
    {
        key: 15,
        type: "item",
        type: "divider"
    },
    {
        key: 16,
        type: "item",
        title: "Settings",
        icon: "settings",
        page: "settings"
    },
    {
        key: 17,
        type: "item",
        title: "Help & Feedback",
        icon: "help",
        page: "help"
    },
    {
        key: 18,
        type: "item",
        title: "About",
        icon: "info",
        page: "agencyAbout"
    },
    {
        key: 19,
        type: "item",
        title: "Switch Agency",
        icon: "swap_horiz",
        page: "agencies"
    }
]


/**
 * Get the menu items for the specified page
 * @param  {string} route Page route
 * @return {array} List of menu items
 */
function getMenuItems(route) {
    let items = [];
    let page = route.name;
    
    // Set items based on page
    if ( page === "agencies" || page == "about" || page == "pageNotFound" ) {
        items = HOME;
    }
    else if ( page === "login" || page == "register" ) {
        items = LOGIN;
    }
    else if ( page === "logout" ) {
        items = [];
    }
    else {
        items = MENU;
    }

    // Set active item
    for ( i in items ) {
        if ( items[i].page == page ) {
            items[i].isActive = true;
        }
        else {
            items[i].isActive = false;
        }
    }

    return items;

}


module.exports = getMenuItems;
