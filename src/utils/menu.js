const config = require("@/utils/config.js");
const user = require("@/utils/user.js");

/**
 * MENU ITEM OBJECT
 * key: integer (required) = menu item index
 * type: string (required) = menu item type (item, badge, divider)
 * title: string (required for 'item') = title text
 * icon: string (required for 'item') = icon name (material design icon)
 * page: string (required for 'item') = router page name
 * query: object = object properties will be passed to router query object
 * params: obejct = object properties will be passed to router params object
 */


// ==== AUTH MENU ITEMS ==== //
const LOGIN = function(vm) {
    return [
        {
            key: 1,
            type: "item",
            title: "Log In",
            icon: "person_outline",
            page: "login",
            query: {
                agency: vm.$route.query.agency,
                src: vm.$route.query.src
            }
        },
        {
            key: 2,
            type: "item",
            title: "Create Account",
            icon: "person_add",
            page: "register",
            query: {
                agency: vm.$route.query.agency,
                src: vm.$route.query.src
            }
        },
        {
            key: 3,
            type: "item",
            title: "Reset Password",
            icon: "lock_open",
            page: "reset",
            query: {
                agency: vm.$route.query.agency,
                src: vm.$route.query.src,
                login: undefined
            }
        },
        {
            key: 4,
            type: "divider"
        },
        {
            key: 5,
            type: "item",
            title: "Agencies",
            icon: "list",
            page: "agencies"
        },
        {
            key: 6,
            type: "item",
            title: "Back",
            icon: "keyboard_arrow_left",
            page: vm.$route.query.src
        }
    ]
}

// ==== NON-AGENCY MENU ITEMS ==== //
const HOME = function(vm) {
    return [
        {
            key: 11,
            type: "item",
            title: "Agencies",
            icon: "list",
            page: "agencies"
        },
        {
            key: 12,
            type: "item",
            title: "Transit Alerts",
            icon: "warning",
            page: "alerts"
        },
        {
            key: 13,
            type: "divider"
        },
        {
            key: 14,
            type: "item",
            title: "About",
            icon: "info",
            page: "about"
        },
        {
            key: 15,
            type: "item",
            title: "Settings",
            icon: "settings",
            page: "settings",
            params: {
                agency: vm.$route.params.agency
            }
        },
        {
            key: 16,
            type: "divider"
        },
        {
            key: 17,
            type: "item",
            title: config.maintainer.name,
            icon: "person_pin",
            page: config.maintainer.website
        }
    ]
}

// ==== AGENCY MENU ITEMS ==== //
const MENU = function(vm) {
    return [
        {
            key: 21,
            type: "item",
            title: "Favorites",
            icon: "star",
            page: "favorites"
        },
        {
            key: 22,
            type: "item",
            title: "Trips",
            icon: "train",
            page: "trips"
        },
        {
            key: 23,
            type: "item",
            title: "Stations",
            icon: "access_time",
            page: "stations"
        },
        {
            key: 24,
            type: "alerts",
            title: "Alerts",
            page: "alerts",
            params: {
                agency: vm.$route.params.agency
            }
        },
        {
            key: 25,
            type: "item",
            title: "Map",
            icon: "map",
            page: "map"
        },
        {
            key: 26,
            type: "favorites"
        },
        {
            key: 27,
            type: "divider"
        },
        {
            key: 28,
            type: "item",
            title: "About",
            icon: "info",
            page: "agencyAbout"
        },
        {
            key: 29,
            type: "item",
            title: "Help & Feedback",
            icon: "help",
            page: "help",
            params: {
                agency: vm.$route.params.agency
            }
        },
        {
            key: 30,
            type: "item",
            title: "Settings",
            icon: "settings",
            page: "settings",
            params: {
                agency: vm.$route.params.agency
            }
        },
        {
            key: 31,
            type: "divider"
        },
        {
            key: 32,
            type: "item",
            title: "Switch Agency",
            icon: "swap_horiz",
            page: "agencies"
        }
    ]
}


/**
 * Get the items based on the current route
 * @param  {Vue} vm    Vue Instance
 * @return {[type]}    List of menu items
 */
function getMenuItems(vm) {
    let page = vm.$route.name;
    let agency = vm.$router.currentRoute.params.agency || vm.$router.currentRoute.query.agency;
    if ( ["agencies", "about", "pageNotFound"].includes(page) || ( !agency && ["alerts", "settings"].includes(page) ) ) {
        return HOME(vm);
    }
    else if ( ["login", "register", "reset", "verify"].includes(page) ) {
        return LOGIN(vm);
    }
    else if ( page === "logout" ) {
        return [];
    }
    else {
        return MENU(vm);
    }
}


module.exports = getMenuItems;
