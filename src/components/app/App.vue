<template>
    <div class="page-container">
        <md-app md-waterfall md-mode="fixed">
            

            <!-- MAIN APP TOOLBAR -->
            <md-app-toolbar class="md-primary rt-primary">
                
                <!-- DRAWER TOGGLE -->
                <md-button class="md-icon-button md-xsmall-show" @click="menuVisible = !menuVisible">
                    <md-icon class="rt-primary-text">menu</md-icon>
                </md-button>

                <!-- APP TITLE -->
                <span id="app-title" class="md-title rt-primary-text" style="flex: 1">{{ toolbarTitle }}</span>
                
                <!-- TODO: Add More Menu Icons here for (hide small, xsmall) -->

                <!-- AUTH BUTTON -->
                <md-button v-if="authButton.visible" class="md-xsmall-hide rt-primary-text" @click="auth"><md-icon>{{ authButton.icon }}</md-icon> {{ authButton.text }}</md-button>
                <md-button v-if="authButton.visible" class="md-xsmall-show md-icon-button rt-primary-text" @click="auth"><md-icon>{{ authButton.icon }}</md-icon></md-button>
                
                <!-- MORE MENU -->
                <md-menu md-size="small" v-if="moreMenu">
                    <md-button md-menu-trigger class="md-icon-button"><md-icon>more_vert</md-icon></md-button>
                    <md-menu-content>
                        <div v-for="item in moreMenu" :key="item.key">
                            <hr v-if="item.type=='divider'" class="more-menu-divider" />
                            <md-menu-item v-if="item.type=='item'" @click="item.function">{{ item.title }}</md-menu-item>
                        </div>
                    </md-menu-content>
                </md-menu>

            </md-app-toolbar>


            <!-- MAIN APP DRAWER -->
            <md-app-drawer :md-active.sync="menuVisible" md-permanent="clipped">
                <rt-drawer-menu :favorites="favorites.favorites" @menuItemSelected="onMenuItemSelected"></rt-drawer-menu>
            </md-app-drawer>


            <!-- MAIN APP CONTENT -->
            <md-app-content>

                <!-- ROUTER VIEW CONTENT -->
                <router-view 
                    @setMoreMenuItems="onSetMoreMenuItems" 
                    @setTitle="onSetTitle" 
                    @showDialog="onShowDialog" 
                    @showSnackbar="onShowSnackbar">
                </router-view>
                
                <!-- BOTTOM BAR -->
                <rt-bottom-bar v-if="bottomBarEnabled"></rt-bottom-bar>

                <!-- APP CONFIRMATION DIALOG -->
                <md-dialog :md-active.sync="dialog.active" :md-close-on-esc="false" :md-click-outside-to-close="false" :md-fullscreen="false">
                    <md-dialog-title>{{ dialog.title }}</md-dialog-title>
                    <md-dialog-content v-html="dialog.content"></md-dialog-content>
                    <md-dialog-actions>
                        <md-button class="md-flat" @click="dialog.onCancel">{{ dialog.cancel }}</md-button>
                        <md-button class="md-raised" @click="dialog.onConfirm">{{ dialog.confirm }}</md-button>
                    </md-dialog-actions>
                </md-dialog>

                <!-- APP PROGRESS DIALOG -->
                <md-dialog :md-active.sync="progress.active" :md-close-on-esc="false" :md-click-outside-to-close="false" :md-fullscreen="false">
                    <md-dialog-title>{{ progress.title }}</md-dialog-title>
                    <md-dialog-content style="text-align: center">
                        <md-progress-spinner :v-if="progress.type==='spinner'" md-mode="indeterminate"></md-progress-spinner>
                    </md-dialog-content>
                </md-dialog>

                <!-- APP SNACKBAR -->
                <md-snackbar md-position="center" :md-duration="snackbar.duration ? snackbar.duration : 4000" :md-active.sync="snackbar.visible" md-persistent>
                    <span style="100%">{{ snackbar.message }}</span>
                    <md-button class="md-flat" @click="snackbar.visible=false">Dismiss</md-button>
                </md-snackbar>

            </md-app-content>


        </md-app>
    </div>
</template>


<script>
    const Vue = require("vue").default;
    const config = require("@/utils/config.js");
    const cache = require("@/utils/cache.js");
    const user = require("@/utils/user.js");
    const database = require("@/utils/db.js");
    const favorites = require("@/utils/favorites.js");
    const DrawerMenu = require("@/components/app/Menu.vue").default;
    const BottomBar = require("@/components/app/BottomBar.vue").default;
    const bottomBarPages = ['favorites', 'trips', 'stations', 'agencyAlerts'];



    /**
     * Get Agency Information (via cache)
     * @param  {string} agency Agency ID
     * @param  {Function} callback Callback function(err, info)
     */
    function _getAgencyInformation(agency, callback) {
        cache.getAgencies(function(err, agencies) {
            if ( err ) {
                return callback(err);
            }
            for ( let i = 0; i < agencies.length; i++ ) {
                if ( agencies[i].id == agency ) {
                    return callback(null, agencies[i]);
                }
            }
            return callback(new Error("Unknown Agency!"));
        });
    }


    /**
     * Page Update Procedure
     * - Check Logged In State
     * - Update Agency Information, if changed
     * - Prep Agency Database, if necessary
     * - Enable / Disable Bottom Bar
     * - Apply Theme
     * - Update Favorites, if necessary
     * - Reapply Theme, if favorites updated
     * - Reset Title
     * @param  {Vue}      vm          Vue Instance
     * @param  {Function} [callback]  Callback function()
     */
    function _pageUpdate(vm, callback) {

        // Reset Toolbar Title
        vm.toolbarTitle = undefined;

        // Check Logged In State
        _checkLoggedIn(vm);

        // Update the Agency
        _updateAgency(vm, function() {

            // Set Title
            _setTitle(vm);

            // Prep the Database
            _prepDatabase(vm);

            // Enable / Disbale Bottom Bar
            vm.bottomBarEnabled = bottomBarPages.includes(vm.$route.name);
            
            // Apply theme colors
            Vue.nextTick(function() {
                _applyTheme(vm);
            });

            // Update the Favorites
            _updateFavorites(vm);

        });

    }


    /**
     * Set the Document and Toolbar Titles
     * @param {Vue}    vm    Vue Instance
     * @param {string} title Page Title
     */
    function _setTitle(vm, title) {
        if ( title === undefined ) {
            title = vm.agencyName ? vm.agencyName : config.title;
        }

        if ( title !== config.title && title !== vm.agencyName && vm.agencyName !== undefined ) {
            document.title = title + " | " + vm.agencyName + " | " + config.title;
        }
        else if ( title !== config.title ) {
            document.title = title + " | " + config.title;
        }
        else {
            document.title = title;
        }

        vm.toolbarTitle = title;
    }


    /**
     * Update the Agency Information
     * - Agency ID
     * - Agency Name
     * - Theme Colors
     * @param  {Vue}      vm         Vue Instance
     * @param  {Function} [callback] Callback function()
     */
    function _updateAgency(vm, callback) {
        let agencyId = vm.$route.query.agency ? vm.$route.query.agency : vm.$route.params.agency;

        // Agency has changed...
        if ( agencyId !== vm.agencyId ) {
            vm.agencyId = agencyId;

            // Set Agency Properties
            if ( agencyId !== undefined ) {
                _getAgencyInformation(agencyId, function(err, agency) {
                    if ( err ) {
                        vm.$router.replace({name: "agencies"});
                    }
                    else {
                        vm.agencyName = agency.name;
                        vm.colors = agency.config.colors;
                        if ( callback ) return callback();
                    }
                });
            }

            // Clear Agency Properties
            else {
                vm.agencyName = undefined;
                vm.colors = config.colors;
                if ( callback ) return callback();
            }

        }

        // Agency has not changed...
        else {
            if ( callback ) return callback();
        }
        
    }


    /**
     * Apply Theme Colors
     * @param {Vue} vm    Vue Instance
     */
    function _applyTheme(vm) {
        let colors = vm.colors;
        let theme = config.theme;
        for ( let i = 0; i < theme.length; i++ ) {
            let t = theme[i];
            for ( const property in t.style ) {
                if ( t.style.hasOwnProperty(property) ) {
                    let color = t.style[property];
                    if ( !color.startsWith("#") ) {
                        color = colors[color]
                    }
                    for ( let j = 0; j < t.selectors.length; j++ ) {
                        let elems = document.querySelectorAll(t.selectors[j]);
                        if ( elems !== undefined ) {
                            for ( let k = 0; k < elems.length; k++ ) {
                                elems[k].style[property] = color;
                            }
                        }
                    }
                }
            }
        }
    }


    /**
     * Check for Agency DB in cache.  If not present, show loading 
     * dialog and get database ready.
     * @param  {Vue}    vm       Vue Instance
     * @param  {string} agencyId Agency ID Code
     */
    function _prepDatabase(vm) {
        if ( vm.agencyId && !database.isReady(vm.agencyId) ) {
            vm.progress = {
                active: true,
                title: "Preparing Database...",
                type: "spinner"
            }
            database.getDB(vm.agencyId, function() {
                vm.progress.active = false;
            });
        }
    }


    /**
     * Update the User's favorites, if agency has changed, for the side menu
     * @param  {Vue}      vm         Vue Instance
     * @param  {boolean}  [force]    Force update of favorites
     */
    function _updateFavorites(vm, force) {
        if ( force || (vm.agencyId && vm.agencyId !== vm.favorites.agencyId) ) {
            favorites.getFavorites(vm.agencyId, function(err, favorites) {
                vm.favorites.favorites = favorites;
                vm.favorites.agencyId = vm.agencyId;
                
                // Reapply the Theme
                Vue.nextTick(function() {
                    _applyTheme(vm);
                });
            });
        }
    }


    /**
     * Check the User Logged In state and update the Auth Button
     * @param  {Vue}      vm         Vue Instance
     * @param  {Function} [callback] Callback function()
     */
    function _checkLoggedIn(vm, callback) {
        user.isLoggedIn(function(isLoggedIn, user) {
            vm.authButton = {
                visible: !vm.$route.path.startsWith("/auth"),
                icon: isLoggedIn ? "person" : "person_outline",
                text: isLoggedIn ? user.username : "Log In",
                page: isLoggedIn ? "logout" : "login"
            }
        });
    }


    /**
     * Start the Auth process by chaging to the login/logout page
     * @param  vm Vue Instance
     */
    function _startAuth(vm) {
        vm.$router.push({
            name: vm.authButton.page,
            query: {
                agency: vm.agencyId,
                src: vm.$route.path
            }
        });
    }


    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {

                // Configuration settings
                config: config,

                // Theme Colors
                colors: config.colors,

                // Current Agency ID
                agencyId: undefined,

                // Current Agency Name
                agencyName: undefined,

                // Toolbar Title
                toolbarTitle: config.title,

                // Auth Button Properties
                authButton: {
                    visible: undefined,
                    icon: undefined,
                    text: undefined,
                    page: undefined
                },

                // Menu visibility flag
                menuVisible: false,

                // Favorites for the Menu
                favorites: {
                    agencyId: undefined,
                    favorites: []
                },

                // Bottom Bar visibility flag
                bottomBarEnabled: bottomBarPages.includes(this.$router.currentRoute.name),

                // More Menu Items
                moreMenu: false,

                // Confirmation Dialog Info
                dialog: {
                    active: false,
                    title: undefined,
                    content: undefined,
                    confirm: undefined,
                    cancel: undefined,
                    onConfirm: undefined,
                    onCancel: undefined
                },

                // Progress Dialog Info
                progress: {
                    active: false,
                    title: undefined,
                    type: undefined
                },

                // Snackbar Info
                snackbar: {
                    visible: false,
                    message: undefined,
                    duration: undefined
                }
            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-drawer-menu': DrawerMenu,
            'rt-bottom-bar': BottomBar
        },

        // ==== COMPONENT FUNCTIONS ==== //
        methods: {

            /**
             * Change to the login/logout page
             * @return {[type]} [description]
             */
            auth() {
                let vm = this;

                // LOGOUT
                if ( vm.authButton.page === "logout" ) {
                    vm.onShowDialog(
                        "Log Out?",
                        "<p>Are you sure you want to log out?</p><p>Your saved favorites will be removed from this device and you will need to log back in to access your favorites.</p>",
                        "Log Out",
                        "Cancel",
                        function() {
                            _startAuth(vm);
                        }
                    );
                }

                // LOGIN
                else {
                    _startAuth(vm);
                }

            },

            /**
             * Hide the drawer menu when an item is selected
             * @param {string} route The name of the next route
             */
            onMenuItemSelected(route) {
                this.menuVisible = false;
            },

            /**
             * Set the More Menu Items
             * @param {Array} items The list of more menu items
             */
            onSetMoreMenuItems(items) {
                if ( items && items.length > 0 ) {
                    this.moreMenu = items;
                }
                else {
                    this.moreMenu = false;
                }
            },


            /**
             * Set the Document and Toolbar Title
             * @param  {string} title Toolbar Title
             */
            onSetTitle(title) {
                let vm = this;
                Vue.nextTick(function() {
                    _setTitle(vm, title);
                });
            },
            

            /**
             * Show a confirmation dialog
             * @param  {string} title     Dialog title
             * @param  {string} content   Dialog content (can be HTML)
             * @param  {string} confirm   Dialog confirm button title
             * @param  {string} cancel    Dialog cancel button title
             * @param  {Function} onConfirm Dialog confirm button function (will close dialog)
             * @param  {Function} [onCancel]  Dialog cancel button function (will close dialog)
             */
            onShowDialog(title, content, confirm, cancel, onConfirm, onCancel) {
                let vm = this;
                vm.dialog = {
                    active: true,
                    title: title,
                    content: content,
                    confirm: confirm,
                    cancel: cancel,
                    onConfirm: function() {
                        vm.dialog.active = false;
                        onConfirm();
                    },
                    onCancel: function() {
                        vm.dialog.active = false;
                        if ( onCancel ) {
                            onCancel();
                        }
                    }
                }
            },

            /**
             * Display the site snackbar with the specified message
             * @param  {string} message  Snackbar Message
             * @param  {integer} [duration] Snackbar Duration (ms)
             */
            onShowSnackbar(message, duration) {
                this.snackbar.message = message;
                this.snackbar.duration = duration;
                this.snackbar.visible = true;
            }
        },

        // ==== COMPONTENT MOUNTED ==== //
        mounted: function() {
            _pageUpdate(this);
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {

            /**
             * Watch for route changes
             * - run page update
             * @param  {Route} to To Route
             * @param  {Route} from From Route
             */
            $route: function(to, from) {
                let vm = this;

                // Update the Page
                Vue.nextTick(function() {
                    _pageUpdate(vm);
                });

                // Update favorites after login/logout
                if ( from.name === "login" || from.name === "logout" ) {
                    _updateFavorites(vm, true);
                }
            }

        }

    }
</script>


<style lang="scss" scoped>
    // Set theme properties
    @import "~vue-material/dist/theme/engine";
    @include md-register-theme("default", (
        primary: #424242,
        accent: #607d8b,
        theme: light
    ));
    @import "~vue-material/dist/theme/all";

    // Main App Components
    .md-app-drawer {
        padding-top: 15px;
        width: 230px;
        height: calc(100vh - 64px);
        z-index: 1000;
        background-color: #fff;
        border-right: 1px solid #ddd;
    }
    .md-app-toolbar {
        height: 64px;
    }
    .md-app-content {
        height: calc(100vh - 64px);
        overflow: auto;
        background-color: #eee !important;
        padding-bottom: 50px;
    }

    // More Menu Components
    .more-menu-divider {
        border-top: 1px solid rgba(238, 238, 238, 0.75);
        color: rgba(238, 238, 238, 0.75);
    }
</style>
