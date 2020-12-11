<template>
    <div>

        <!-- Database Update -->
        <v-slide-y-transition>
            <v-list v-if="update.isAvailable" class="py-0 secondary-bg" two-line>
                <v-list-tile @click="startUpdate">
                    <v-list-tile-action>
                        <v-icon>save_alt</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Database Update</v-list-tile-title>
                        <v-list-tile-sub-title>Download and Install</v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-slide-y-transition>

        <!-- App Update -->
        <v-slide-y-transition>
            <v-list v-if="appUpdate.isAvailable" class="py-0 secondary-bg" two-line>
                <v-list-tile @click="startAppUpdate">
                    <v-list-tile-action>
                        <v-icon>refresh</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>App Update</v-list-tile-title>
                        <v-list-tile-sub-title>Reload App to Install</v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-slide-y-transition>

        <!-- User Info -->
        <v-list v-if="auth.display" class="py-0">
            <v-list-tile @click="startAuth">
                <v-list-tile-action>
                    <v-icon v-if="auth.isLoggedIn">person</v-icon>
                    <v-icon v-if="!auth.isLoggedIn">person_outline</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title v-if="auth.isLoggedIn">Log Out</v-list-tile-title>
                    <v-list-tile-title v-if="!auth.isLoggedIn">Log In</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>
        </v-list>
        <v-divider></v-divider>

        <!-- Menu Items List -->
        <v-list class="pt-0" subheader>
            <template v-for="(item, index) in menu">

                <!-- Divider -->
                <v-divider :key="'div-' + index" v-if="item.type === 'divider'" />

                <!-- Menu Item -->
                <v-list-tile :key="'item-' + index" v-if="item.type === 'item'" :class="{'active-menu-item': isActiveMenuItem(item, 'item')}" @click="drawerLink(item)">
                    <v-list-tile-action>
                        <v-icon>{{ item.icon }}</v-icon>                        
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>

                <!-- Alerts Item -->
                <v-list-tile :key="'alert-' + index" v-if="item.type === 'alerts'" :class="{'active-menu-item': isActiveMenuItem(item, 'item')}" @click="drawerLink(item)">
                    <v-list-tile-action>
                        <v-icon v-if="transitAlertCount && transitAlertCount > 0">warning</v-icon>
                        <v-icon v-else>check_circle</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                        <span v-if="transitAlertCount && transitAlertCount > 0 && !isActiveMenuItem(item, 'item')" 
                              class="alerts-badge primary-bg">
                          {{ transitAlertCount }}
                      </span>
                    </v-list-tile-content>
                </v-list-tile>

                <!-- Favorites Expansion Panel -->
                <div :key="'fav-' + index" v-if="item.type === 'favorites' && favorites && favorites.length > 0">
                    <v-divider></v-divider>
                    <v-expansion-panel class="favorites-expansion-panel" v-model="favoritesExpansion">
                        <v-expansion-panel-content>
                            
                            <!-- Favorites Sub Header -->
                            <template v-slot:header>
                                <v-subheader class="favorites-list-subheader">Favorites</v-subheader>
                            </template>

                            <!-- Favorites List -->
                            <template v-for="(favorite, index) in favorites">
                                <v-list-tile :key="'fav-item-' + index" :class="{'active-menu-item': isActiveMenuItem(favorite, 'favorite')}" @click="favoriteLink(favorite)">
                                    <v-list-tile-action>
                                        <v-icon>{{ favorite.icon }}</v-icon>
                                    </v-list-tile-action>
                                    <v-list-tile-content>
                                        <v-list-tile-title class="favorites-list-label-container">
                                            <div class="favorites-list-label-text">
                                                {{ favorite.label }}
                                            </div>
                                        </v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                            </template>

                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </div>

            </template>
        </v-list>
    </div>
</template>


<script>
    const menu = require("@/utils/menu.js");
    const user = require("@/utils/user.js");
    const store = require("@/utils/store.js");
    const STORE_KEY = "setting-menu-favorites-expansion";


    /**
     * Update Procedure
     * - Get Menu Items
     * - Set Favorites Expansion
     * - Check Logged In State
     */
    function _update(vm) {
        _setMenuItems(vm);
        _setFavoritesExpansion(vm);
        vm.auth.display = !["login", "logout", "register", "reset"].includes(vm.$router.currentRoute.name);
        if ( vm.auth.display ) {
            _checkLoggedIn(vm);
        }
    }


    /**
     * Set the Menu Items
     * - get menu items from utils/menu.js
     * @param  {Vue} vm    Vue Instance
     */
    function _setMenuItems(vm) {
        vm.menu = menu(vm);
    }

    /**
     * Check the User Logged In state and update the Auth Button
     * @param  {Vue}      vm         Vue Instance
     * @param  {Function} [callback] Callback function()
     */
    function _checkLoggedIn(vm, callback) {
        user.isLoggedIn(function(isLoggedIn, user) {
            vm.auth.isLoggedIn = isLoggedIn;
            vm.auth.user = user;
            if ( callback ) return callback();
        });
    }

    /**
     * Start the Auth process by chaging to the login/logout page
     * @param {Vue}    vm   Vue Instance
     * @param {String} page Auth router page name
     */
    function _startAuth(vm, page) {
        vm.$router.push({
            name: page,
            query: {
                agency: vm.$router.currentRoute.params.agency,
                src: vm.$route.path
            }
        });
    }

    /**
     * Set the favorites expansion panel setting
     * @param {Vue} vm Vue Instance
     */
    function _setFavoritesExpansion(vm) {
        store.get(STORE_KEY, function(err, value) {
            if ( value === undefined || value === true ) {
                vm.favoritesExpansion = 0;
            }
        });
    }

    /**
     * Store the favorites expansion panel setting
     * @param  {Vue} vm Vue Instance
     */
    function _storeFavoritesExpansion(vm) {
        let value = vm.favoritesExpansion === 0;
        store.put(STORE_KEY, value);
    }


    module.exports = {

        // ==== COMPONENT PROPERTIES ==== //
        props: {
            favorites: {
                type: Array,
                default: []
            },
            update: {
                type: Object,
                default: {
                    isAvailable: false,
                    version: undefined,
                    message: undefined
                }
            },
            appUpdate: {
                type: Object,
                default: {
                    isAvailable: false,
                    version: undefined
                }
            },
            transitAlertCount: {
                type: Number,
                default: 0
            }
        },
        
        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                menu: [],
                auth: {
                    isLoggedIn: false,
                    display: undefined,
                    user: undefined
                },
                favoritesExpansion: null
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Determine if a menu item should be classified as active
             * @param  {Object}  item Menu Item / Favorite
             * @param  {string}  type 'item' or 'favorite'
             * @return {Boolean}      True if the item is active
             */
            isActiveMenuItem(item, type) {
                let current = this.$router.currentRoute.name;
                
                // Item
                if ( type === "item" ) {
                    return current === item.page;
                }

                // Favorite
                else if ( type === "favorite" ) {
                    if ( current === "station" && item.type === 1 ) {
                        return this.$router.currentRoute.params.stop === item.stop.id;
                    }
                    else if ( current === "trip" && item.type === 2 ) {
                        return this.$router.currentRoute.params.origin === item.origin.id && 
                               this.$router.currentRoute.params.destination === item.destination.id;
                    }
                    else if ( current === "alerts" && item.type === 3 ) {
                        return this.$router.currentRoute.params.transitAgency === item.agency.id &&
                            this.$router.currentRoute.params.transitDivision === item.division.code &&
                            this.$router.currentRoute.params.transitLine === item.line.code
                    }
                    else {
                        return false;
                    }
                }
            },

            /**
             * Start the auth procedure
             */
            startAuth() {
                let vm = this;

                // LOGOUT
                if ( vm.auth.isLoggedIn ) {
                    vm.$emit("showDialog",
                        "Log Out?",
                        "<p class='subheading'>Are you sure you want to log out?</p><p class='subheading'>Your saved favorites will be removed from this device and you will need to log back in to access your favorites.</p>",
                        "Log Out",
                        "Cancel",
                        function() {
                            _startAuth(vm, 'logout');
                        }
                    );
                }

                // LOGIN
                else {
                    _startAuth(vm, 'login');
                }
            },

            /**
             * Start the DB Update Process
             */
            startUpdate() {
                this.$emit('startUpdate');
            },

            /**
             * Start the App Update Process
             */
            startAppUpdate() {
                this.$emit('startAppUpdate');
            },

            /**
             * Handle a menu drawer link
             * - Set the router to view the linked route
             * @param  {Object} item Menu Item
             */
            drawerLink(item) {
                let route = item.page;
                let params = item.params;
                let query = item.query;
                
                // Route not defined
                if ( !route ) {
                    route = "/";
                }

                // Go to external site
                if ( route.startsWith("http") ) {
                    window.location = route;
                }

                // Go to Router Path
                else if ( route.startsWith("/") ) {

                    // Set Router with properties
                    this.$router.push({
                        path: route,
                        params: params,
                        query: query
                    });

                }

                // Set Router Link
                else {

                    // Set Router with properties
                    this.$router.push({
                        name: route,
                        params: params,
                        query: query
                    });

                }

            },

            /**
             * Handle a menu favorite link
             * @param  {Object} favorite Selected favorite
             */
            favoriteLink(favorite) {

                // Station
                if ( favorite.type === 1 ) {
                    this.$router.push({
                        name: "station",
                        params: {
                            agency: this.$route.params.agency,
                            stop: favorite.stop.id
                        }
                    });
                }

                // Trip
                else if ( favorite.type === 2 ) {
                    this.$router.push({
                        name: "trip",
                        params: {
                            agency: this.$route.params.agency,
                            origin: favorite.origin.id,
                            destination: favorite.destination.id
                        }
                    });
                }

                // Transit
                else if ( favorite.type === 3 ) {
                    this.$router.push({
                        name: "alerts",
                        params: {
                            agency: this.$route.params.agency,
                            transitAgency: favorite.agency.id,
                            transitDivision: favorite.division ? favorite.division.code : undefined,
                            transitLine: favorite.line ? favorite.line.code : undefined
                        }
                    })
                }

            }

        },

        // ==== COMPONENT MOUNTED ==== //
        mounted: function() {
            _update(this);
        },


        // ==== COMPONENT WATCHERS ==== //
        watch: {

            /**
             * Watch for route changes
             * - Update menu items
             * @param  {Route} to To Route
             * @param  {Route} from From Route
             */
            $route: function(to, from) {
                _update(this);
            },

            /**
             * Watch for updates to the favorites list
             */
            favorites: function() {
                _update(this);
            },

            /**
             * Watch for changes in the favorites expansion panel
             * @return {[type]} [description]
             */
            favoritesExpansion: function() {
                _storeFavoritesExpansion(this);
            }

        }

    }
</script>


<style scoped>
    .favorites-expansion-panel {
        box-shadow: none;
    }
    .favorites-list-subheader {
        margin: -16px;
    }
    .favorites-list-label-container {
        height: 100%;
        white-space: normal;
        line-height: 1;
        display: table;
    }
    .favorites-list-label-text {
        display: table-cell;
        vertical-align: middle;
        font-size: 95%;
    }

    .active-menu-item * {
        color: var(--v-primary-base) !important;
    }
    .active-menu-item .v-list__tile__title {
        font-weight: 700;
    }

    .alerts-badge {
        position: absolute;
        right: 25px;
        top: 15px;
        font-size: 12px;
        font-weight: 500;
        text-align: center;
        border-radius: 15px;
        min-width: 20px;
        padding: 1px;
    }
</style>