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
            type: "divider"
        },
        {
            key: 4,
            type: "item",
            title: "Agencies",
            icon: "list",
            page: "agencies"
        },
        {
            key: 5,
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
            type: "badge",
            title: "Alerts",
            icon: "warning",
            page: "agencyAlerts",
            params: {
                agency: vm.$route.params.agency
            }
        },
        {
            key: 25,
            type: "favorites"
        },
        {
            key: 26,
            type: "divider"
        },
        {
            key: 27,
            type: "item",
            title: "About",
            icon: "info",
            page: "agencyAbout"
        },
        {
            key: 28,
            type: "item",
            title: "Help & Feedback",
            icon: "help",
            page: "help"
        },
        {
            key: 29,
            type: "item",
            title: "Settings",
            icon: "settings",
            page: "settings"
        },
        {
            key: 30,
            type: "divider"
        },
        {
            key: 31,
            type: "item",
            title: "Switch Agency",
            icon: "swap_horiz",
            page: "agencies"
        }
    ]
}


/**
 * Get the menu items for the specified page
 * @param  {Vue} vm          Vue Instance
 * @param  {Array} favorites User Favorites
 * @return {array}           List of menu items
 */
function getMenuItems(vm, favorites) {
    
    // Set items based on page
    let items = _getItems(vm)

    // Add favorites
    for ( let i = 0; i < items.length; i++ ) {
        if ( items[i].type === "favorites" ) {
            let a = items.slice(0, i);
            let b = items.slice(i+1);
            let favs = _buildFavoriteItems(favorites);
            items = a.concat(favs).concat(b);
            break;
        }
    }

    // Set active menu item
    for ( let i = 0; i < items.length; i++ ) {
        items[i].isActive = false;
        if ( items[i].type === 'favorite' ) {
            if ( items[i].favorite.type === 1 && vm.$route.name === "station" ) {
                items[i].isActive = items[i].favorite.stop.id === vm.$route.params.stop;
            }
            else if ( items[i].favorite.type === 2 && vm.$route.name === "trip" ) {
                items[i].isActive = items[i].favorite.origin.id === vm.$route.params.origin && items[i].favorite.destination.id === vm.$route.params.destination;
            }
        }
        else if ( items[i].page === vm.$route.name ) {
            items[i].isActive = true;
        }
    }

    // Return the menu items
    return items;

}

/**
 * Get the items based on the current route
 * @param  {Vue} vm    Vue Instance
 * @return {[type]}    List of menu items
 */
function _getItems(vm) {
    let page = vm.$route.name;
    if ( page === "agencies" || page == "about" || page == "alerts" || page == "pageNotFound" ) {
        return HOME(vm);
    }
    else if ( page === "login" || page == "register" ) {
        return LOGIN(vm);
    }
    else if ( page === "logout" ) {
        return [];
    }
    else {
        return MENU(vm);
    }
}

/**
 * Build the Favorites Menu Items
 * @param  {Array} favorites User Favorites
 * @return {Array}           List of Favorites menu items
 */
function _buildFavoriteItems(favorites) {
    let items = [];

    // Add Divider, if there are favorites
    if ( favorites.length > 0 ) {
        items.push({
            key: 100,
            type: "divider"
        });
    }

    // Add Each Favorite
    for ( let i = 0; i < favorites.length; i++ ) {
        let page = undefined;
        if ( favorites[i].type === 1 ) {
            page = "station";
        }
        else if ( favorites[i].type === 2 ) {
            page = "trip";
        }
        items.push({
            key: 101 + i,
            type: "favorite",
            title: favorites[i].label,
            icon: favorites[i].icon,
            page: page,
            favorite: favorites[i]
        });
    }

    return(items);
}


module.exports = getMenuItems;
