<template>
    <v-app>

        <!-- NAVIGATION DRAWER -->
        <v-navigation-drawer mobile-break-point="960" width="250" v-model="drawerVisible" clipped app>
            <rt-drawer-menu 
                :favorites="favorites.favorites" 
                :update="update"
                :transitAlertCount="transitAlertCount"
                @showDialog="onShowDialog"
                @startUpdate="onStartUpdate">
            </rt-drawer-menu>
        </v-navigation-drawer>


        <!-- APP TOOLBAR -->
        <v-toolbar id="app-toolbar" class="primary-bg" clipped-left fixed app>
            
            <!-- Menu Toggle -->
            <v-toolbar-side-icon @click.stop="toggleDrawer"></v-toolbar-side-icon>
            <v-fade-transition>
                <span v-if="update.isAvailable && !drawerVisible" class="toolbar-badge secondary-bg"></span>
            </v-fade-transition>

            <!-- Toolbar Title -->
            <v-toolbar-title @click="onClickToolbar" class="toolbar-title" :style="{'cursor': agencyId ? 'pointer' : 'auto'}">
                {{ toolbarTitle }}
            </v-toolbar-title>
            
            <v-spacer></v-spacer>

            <!-- TOOLBAR MENU ITEMS -->
            <template 
                    v-if="toolbarMenu && toolbarMenu.length > 0" 
                    v-for="item in toolbarMenu">
                <v-btn :disabled="item.disabled" dark icon>
                    <v-icon v-if="item.type==='icon'" @click="item.function">{{ item.icon }}</v-icon>
                </v-btn>
            </template>

            <!-- MORE MENU ITEMS -->
            <v-menu v-if="moreMenu  && moreMenu.length > 0" allow-overflow absolute top right>
                <template v-slot:activator="{ on }">
                    <v-btn dark icon v-on="on">
                        <v-icon>more_vert</v-icon>
                    </v-btn>
                </template>
                <v-list id="more-menu-list">
                    <div v-for="item in moreMenu" :key="item.key">
                        
                        <!-- Menu Divider -->
                        <v-divider v-if="item.type==='divider'"></v-divider>
                        <v-subheader v-if="item.type==='divider' && item.title">{{ item.title }}</v-subheader>

                        <!-- Menu Item -->
                        <v-list-tile v-if="item.type==='item'" @click="item.function">
                            <v-icon v-if="item.icon" class="more-menu-list-icon">{{ item.icon }}</v-icon>
                            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                        </v-list-tile>

                    </div>
                </v-list>
            </v-menu>

            <!-- TOOLBAR PROGRESS BAR -->
            <v-fade-transition>
                <v-progress-linear class="toolbar-progress" 
                        v-if="toolbarProgress.isActive"
                        color="secondary"
                        height="5"
                        :value="toolbarProgress.progress" 
                        :indeterminate="!toolbarProgress.progress">
                </v-progress-linear>
            </v-fade-transition>

        </v-toolbar>
        

        <!-- APP CONTENT -->
        <v-content>

            <!-- OFFLINE ALERT -->
            <rt-offline-alert :visible="!networkOnline" :drawerVisible="drawerVisible"></rt-offline-alert>

            <v-container fluid>
                
                <!-- ROUTER VIEW CONTENT -->
                <transition name="fade">
                    <router-view 
                        :updateInfo="update"
                        :transitInfo="transitInfo"
                        :transitFeed="transitFeed"
                        @setToolbarMenuItems="onSetToolbarMenuItems"
                        @setMoreMenuItems="onSetMoreMenuItems" 
                        @setTitle="onSetTitle" 
                        @setProgress="onSetProgress"
                        @setStatusBar="onSetStatusBar"
                        @updateFavorites="onUpdateFavorites"
                        @showDialog="onShowDialog" 
                        @showSnackbar="onShowSnackbar"
                        @checkUpdate="onCheckUpdate"
                        @startUpdate="onStartUpdate">
                    </router-view>
                </transition>

                <!-- BOTTOM BAR -->
                <rt-bottom-bar v-if="bottomBarEnabled" :transitAlertCount="transitAlertCount"></rt-bottom-bar>

                <!-- APP CONFIRMATION DIALOG -->
                <rt-confirmation-dialog :properties="dialog"></rt-confirmation-dialog>

                <!-- APP PROGRESS DIALOG -->
                <rt-progress-dialog :properties="progress"></rt-progress-dialog>

                <!-- APP SNACKBAR -->
                <rt-snackbar :properties="snackbar"></rt-snackbar>

            </v-container>
        </v-content>

        <!-- STATUS BAR -->
        <rt-status-bar
            :drawerVisible="drawerVisible"
            :properties="statusBar" 
            :transitInfo="transitInfo" 
            :transitFeed="transitFeed">
        </rt-status-bar>

    </v-app>
</template>


<script>
    const Vue = require("vue").default;
    
    const config = require("@/utils/config.js");
    const cache = require("@/utils/cache.js");
    const user = require("@/utils/user.js");
    const database = require("@/utils/db.js");
    const favorites = require("@/utils/favorites.js");
    const updates = require("@/utils/updates.js");
    const store = require("@/utils/store.js");
    const transit = require("@/utils/transit.js");
    
    const DrawerMenu = require("@/components/app/Menu.vue").default;
    const BottomBar = require("@/components/app/BottomBar.vue").default;
    const StatusBar = require("@/components/app/StatusBar.vue").default;
    const ConfirmationDialog = require("@/components/app/ConfirmationDialog.vue").default;
    const ProgressDialog = require("@/components/app/ProgressDialog.vue").default;
    const Snackbar = require("@/components/app/Snackbar.vue").default;
    const OfflineAlert = require("@/components/app/OfflineAlert.vue").default;

    const BOTTOM_BAR_PAGES = ['favorites', 'trips', 'stations', 'alerts'];

    const APP_DRAWER_VISIBLE_KEY = "app-drawer-visible";
    const APP_DRAWER_VISIBLE_CUTOFF = 960;

    const TRANSIT_FEED_TIMER = undefined;
    const TRANSIT_FEED_UPDATE_INTERVAL = 300;



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
     * - Reset Menu Items
     * - Enable / Disable Bottom Bar
     * - Update Agency Information, if changed
     * - Prep Agency Database, if necessary
     * - Update Favorites, if necessary
     * @param  {Vue}      vm          Vue Instance
     * @param  {Function} [callback]  Callback function()
     */
    function _pageUpdate(vm, callback) {

        // Reset Menu Items
        vm.toolbarMenu = false;
        vm.moreMenu = false;
        vm.toolbarProgress = {
            isActive: false
        }

        // Reset Title
        _setTitle(vm);

        // Enable / Disbale Bottom Bar
        vm.bottomBarEnabled = _isBottomBarEnabled(vm);

        // Reset Status Bar
        vm.statusBar = {};

        // Update the Agency
        _updateAgency(vm, function() {

            // Set Title
            _setTitle(vm);

            // Prep the Database
            _prepDatabase(vm);

            // Update the Favorites
            _updateFavorites(vm);

            // Check for DB Update
            _dbUpdateCheck(vm);

            // Update Transit Feed
            _updateTransitFeed(vm);

            // Set Transit Feed Update Timer
            if ( TRANSIT_FEED_TIMER ) {
                clearInterval(TRANSIT_FEED_TIMER);
            }
            setInterval(function() {
                _updateTransitFeed(vm);
            }, TRANSIT_FEED_UPDATE_INTERVAL*1000)

        });

        // Clear update info if no agency specified
        if ( !vm.agencyId ) {
            vm.update = {};
        }

    }


    /**
     * Determine if the Bottom Bar should be enabled
     * @param  {Vue}  vm   Vue Instance
     * @return {Boolean}   True if the bottom bar should be enabled
     */
    function _isBottomBarEnabled(vm) {
        return BOTTOM_BAR_PAGES.includes(vm.$route.name) && vm.agencyId !== undefined;
    }


    /**
     * Set the Document and Toolbar Titles
     * @param {Vue}    vm    Vue Instance
     * @param {string} title Page Title
     */
    function _setTitle(vm, title) {
        if ( title === undefined ) {
            title = vm.agencyTitle ? vm.agencyTitle : config.title;
        }
        
        if ( title !== config.title && title !== vm.agencyTitle && vm.agencyTitle !== undefined ) {
            document.title = title + " | " + vm.agencyTitle;
        }
        else {
            document.title = title;
        }

        vm.toolbarTitle = title ? title : config.title;
    }


    /**
     * Update the Agency Information
     * - Agency ID
     * - Agency Name
     * - Theme Colors
     * @param  {Vue}      vm         Vue Instance
     * @param  {Function} [callback] Callback function(), used when agency has updated
     */
    function _updateAgency(vm, callback) {
        let agencyId = vm.$route.query.agency ? vm.$route.query.agency : vm.$route.params.agency;

        // Agency has changed...
        if ( agencyId !== vm.agencyId ) {
            vm.agencyId = agencyId;
            vm.bottomBarEnabled = _isBottomBarEnabled(vm);

            // Set Agency Properties
            if ( agencyId !== undefined ) {
                _getAgencyInformation(agencyId, function(err, agency) {
                    if ( err ) {
                        vm.$router.replace({name: "agencies"});
                    }
                    else {
                        vm.agencyName = agency.name;
                        vm.agencyTitle = agency.config.title;
                        vm.colors = agency.config.colors;
                        vm.transitInfo = agency.config.transit;
                        _applyTheme(vm);
                        if ( callback ) return callback();
                    }
                });
            }

            // Clear Agency Properties
            else {
                vm.agencyName = undefined;
                vm.agencyTitle = undefined;
                vm.colors = config.colors;
                vm.transitInfo = undefined;
                _applyTheme(vm);
                if ( callback ) return callback();
            }

        }

        // Agency not set
        else if ( !agencyId ) {
            _applyTheme(vm);   
        }
        
    }


    /**
     * Apply Theme Colors
     * @param {Vue} vm    Vue Instance
     */
    function _applyTheme(vm) {
        let colors = vm.colors;
        vm.$vuetify.theme.primary = colors.primary;
        vm.$vuetify.theme.primaryText = colors.primaryText;
        vm.$vuetify.theme.secondary = colors.secondary;
        vm.$vuetify.theme.secondaryText = colors.secondaryText;
        document.querySelector("meta[name=theme-color]").setAttribute("content", colors.primary);
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
            database.getDB(vm.agencyId, function(err, db, update) {
                vm.progress.active = false;
                if ( err ) {
                    vm.onShowSnackbar("Error: Could not prep DB");
                }
                if ( update ) {
                    _dbUpdate(vm);
                }
            });
        }
    }


    /**
     * Update the User's favorites, if agency has changed, for the side menu
     * @param  {Vue}      vm         Vue Instance
     * @param  {boolean}  [force]    Force update of favorites
     */
    function _updateFavorites(vm, force) {
        if ( vm.agencyId && (force || (vm.agencyId && vm.agencyId !== vm.favorites.agencyId)) ) {
            favorites.get(vm.agencyId, function(err, favorites) {
                vm.favorites.favorites = favorites;
                vm.favorites.agencyId = vm.agencyId;
            });
        }
    }

    /**
     * Update the Transit Feed for the agency
     * @param  {Vue}      vm         Vue Instance
     * @param  {boolean}  [force]    Force update of transit feed
     */
    function _updateTransitFeed(vm, force) {
        if ( vm.transitInfo ) {
            transit.getFeed(vm.transitInfo.agency, function(err, feed) {
                if ( err ) {
                    if ( force ) vm.$emit("Could not update transit feed. Please try again later.");
                }
                else {
                    vm.transitFeed = feed;
                    for ( let i = 0; i < feed.divisions.length; i++ ) {
                        if ( feed.divisions[i].code.toLowerCase() === vm.transitInfo.division.toLowerCase() ) {
                            vm.transitAlertCount = feed.divisions[i].eventCount;
                        }
                    }
                }
            });
        }
    }


    /**
     * Check for agency database updates
     * @param  {Vue}     vm         Vue Instance
     * @param  {boolean} [force]    When true, force an update check
     * @param {Function} [callback] Callback function()
     */
    function _dbUpdateCheck(vm, force, callback) {
        if ( callback === undefined && typeof force === 'function' ) {
            callback = force;
            force = false;
        }

        // Agency Set...
        if ( vm.agencyId ) {
            updates.check(vm.agencyId, force, function(err, updateInfo) {
                
                // Update Available
                if ( updateInfo ) {
                    vm.update = {
                        isAvailable: updateInfo.isAvailable,
                        version: updateInfo.version,
                        notes: updateInfo.notes
                    }
                    if ( force ) {
                        vm.onShowSnackbar({
                            message: "A schedule database update is available (" + updateInfo.version + ")",
                            dismiss: "Update",
                            onDismiss: vm.onStartUpdate
                        });
                    }
                }

                // No Update Available
                else {
                    vm.update = {
                        isAvailable: false,
                        version: undefined,
                        notes: undefined
                    }
                    if ( force ) vm.onShowSnackbar("There is no database update available at this time");
                }

                // Return to callback, if provided
                if ( callback ) return callback();

            });
        }

        // Agency Not Set...
        else {
            vm.update = {
                isAvailable: false,
                version: undefined,
                notes: undefined
            }
            if ( callback ) return callback();
        }
    }


    /**
     * Download and Install the latest agency database
     * @param  {Vue} vm Vue Instance
     */
    function _dbUpdate(vm) {

        // Set Progress Dialog
        vm.progress = {
            active: true,
            title: "Downloading Database...",
            type: "linear",
            progress: undefined
        }

        // Start Download and Install
        database.update(vm.agencyId, 
            function(progress) {
                if ( progress > 95 ) {
                    vm.progress.title = "Installing Database...";
                    vm.progress.progress = undefined;
                }
                else {
                    vm.progress.progress = parseFloat(progress);
                }
            }, 
            function(err) {
                if ( err ) { 
                    vm.progress.active = false;
                    vm.onShowSnackbar("ERROR: Could not install database. Please try again later.");
                }
                else {
                    vm.progress.active = false;
                    location.reload();
                }
            }
        );

    }


    /**
     * Update the current network availability status
     * @param  {Vue} vm Vue Instance
     */
    function _updateNetworkAvailabilityStatus(vm) {
        vm.networkOnline = navigator.onLine;
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

                // Current Agency Title
                agencyTitle: undefined,

                // Current Agency Transit Info
                transitInfo: undefined,

                // Current Agency Transit Feed
                transitFeed: undefined,

                // Current Agency Transit Alert Count
                transitAlertCount: undefined,

                // Toolbar Title
                toolbarTitle: config.title,

                // Navigation Drawer Visiblity
                drawerVisible: null,

                // Favorites for the Menu
                favorites: {
                    agencyId: undefined,
                    favorites: []
                },

                // Agency DB Update Information
                update: {
                    isAvailable: false,
                    version: undefined,
                    notes: undefined
                },

                // Bottom Bar visibility flag
                bottomBarEnabled: _isBottomBarEnabled(this),

                // Toolbar Progress Properties
                toolbarProgress: {
                    isActive: false,
                    progress: undefined
                },

                // Toolbar Menu Items
                toolbarMenu: [],

                // More Menu Items
                moreMenu: [],

                // Status Bar Properties
                statusBar: {},

                // Confirmation Dialog Info
                dialog: {
                    active: false,
                    title: undefined,
                    content: undefined,
                    confirm: undefined,
                    cancel: undefined,
                    onConfirm: function(){},
                    onCancel: function(){}
                },

                // Progress Dialog Info
                progress: {
                    active: false,
                    title: undefined,
                    type: undefined,
                    progress: undefined
                },

                // Snackbar Info
                snackbar: {
                    visible: false
                },

                // Network Availability Status
                networkOnline: true

            }
        },


        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-drawer-menu': DrawerMenu,
            'rt-bottom-bar': BottomBar,
            'rt-status-bar': StatusBar,
            'rt-confirmation-dialog': ConfirmationDialog,
            'rt-progress-dialog': ProgressDialog,
            'rt-snackbar': Snackbar,
            'rt-offline-alert': OfflineAlert
        },


        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Toggle the display of the app drawer
             * Save preference for larger screens
             */
            toggleDrawer() {
                this.drawerVisible = !this.drawerVisible;
                if ( window.innerWidth >= APP_DRAWER_VISIBLE_CUTOFF ) {
                    store.put(APP_DRAWER_VISIBLE_KEY, this.drawerVisible);
                }
            },

            /**
             * Handle the click of the toolbar title
             */
            onClickToolbar() {
                if ( this.agencyId ) {
                    this.$router.push({name: "favorites", params: {agency: this.agencyId}});
                }
            },

            /**
             * Set the Toolbar Menu Items
             * @param {Array} items The list of toolbar menu items
             */
            onSetToolbarMenuItems(items) {
                let vm = this;
                Vue.nextTick(function() {
                    if ( items && items.length > 0 ) {
                        vm.toolbarMenu = items;
                    }
                    else {
                        vm.toolbarMenu = false;
                    }
                });
            },

             /**
             * Set the More Menu Items
             * @param {Array} items The list of more menu items
             */
            onSetMoreMenuItems(items) {
                let vm = this;
                Vue.nextTick(function() {
                    if ( items && items.length > 0 ) {
                        vm.moreMenu = items;
                    }
                    else {
                        vm.moreMenu = false;
                    }
                });
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
             * Set the properties of the toolbar progress bar
             * @param  {Boolean} isActive True if progress bar should be displayed
             * @param  {int}     progress Percent progress or undefined for indeterminate
             */
            onSetProgress(isActive, progress) {
                this.toolbarProgress = {
                    isActive: isActive,
                    progress: progress
                }
            },

            /**
             * Set the Status Bar Properties
             * @param  {Object} properties Status Bar Properties
             */
            onSetStatusBar(properties) {
                let vm = this;
                Vue.nextTick(function() {
                    vm.statusBar = properties;
                });
            },

            /**
             * Force a favorites update for the side menu
             * @return {[type]} [description]
             */
            onUpdateFavorites() {
                _updateFavorites(this, true);
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
             * @param {Object} properties Snackbar Properties (or message text)
             */
            onShowSnackbar(properties) {
                if ( typeof properties === 'string' ) {
                    properties = { message: properties };
                }
                properties.visible = true;
                this.snackbar = properties;
            },

            /**
             * Force a database update check
             */
            onCheckUpdate() {
                _dbUpdateCheck(this, true);
            },

            /**
             * Start the database download / update process
             */
            onStartUpdate() {
                let vm = this;
                vm.onShowDialog(
                    "Database Update Available", 
                    "<p class='subheading'>Version <strong>" + vm.update.version + "</strong> of the schedule database is now available. Download and install it now to get the most up to date trip schedules.</p><p style='background-color: #eee; padding: 5px; font-family: monospace'>" + vm.update.notes + "</p>",
                    "Download & Install",
                    "Cancel",
                    function() {
                        _dbUpdate(vm);
                    }
                );
            }

        },

        // ==== COMPONTENT MOUNTED ==== //
        mounted: function() {
            let vm = this;

            // Initial Page Update
            _pageUpdate(vm);

            // Get app drawer visiblity setting
            store.get(APP_DRAWER_VISIBLE_KEY, function(err, visible) {
                if ( window.innerWidth >= APP_DRAWER_VISIBLE_CUTOFF ) {
                    if ( visible !== undefined ) {
                        vm.drawerVisible = visible;
                    }
                }
            });

            // Set Network Availability Listeners
            _updateNetworkAvailabilityStatus(vm);
            window.addEventListener('online',  function() {
                _updateNetworkAvailabilityStatus(vm);
            });
            window.addEventListener('offline', function() {
                _updateNetworkAvailabilityStatus(vm);
            });
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
                _pageUpdate(vm);
                
                // Update favorites after login/logout
                if ( from.name === "login" || from.name === "logout" ) {
                    Vue.nextTick(function() {
                        _updateFavorites(vm, true);
                    });
                }
            }

        }

    }

</script>


<style scoped>
    .v-toolbar {
        z-index: 100 !important;
    }
    .v-navigation-drawer {
        z-index: 200 !important;
    }
    .toolbar-badge {
        position: relative;
        margin-right: -12px;
        top: -6px;
        right: 20px;
        width: 12px;
        height: 12px;
        border-radius: 15px;
    }
    .toolbar-title {
        max-height: 44px;
        line-height: 22px;
        word-wrap: normal !important;
        white-space: normal !important;
    }
    .toolbar-progress {
        position: absolute;
        bottom: 0; 
        left: 0; 
        margin: -5px 0 0 0
    }
    #more-menu-list {
        max-height: calc(100vh - 50px);
        overflow-y: auto;
    }
    .more-menu-list-icon {
        font-size: 18px;
        margin-left: -5px;
        margin-right: 5px;
    }
</style>