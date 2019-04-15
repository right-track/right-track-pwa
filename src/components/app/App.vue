<template>
    <v-app>

        <!-- NAVIGATION DRAWER -->
        <v-navigation-drawer mobile-break-point="960" width="250" v-model="drawerVisible" clipped app>
            <rt-drawer-menu :favorites="favorites.favorites" @showDialog="onShowDialog"></rt-drawer-menu>
        </v-navigation-drawer>


        <!-- APP TOOLBAR -->
        <v-toolbar id="app-toolbar" class="primary-bg" clipped-left fixed app>
            <v-toolbar-side-icon @click.stop="drawerVisible = !drawerVisible"></v-toolbar-side-icon>
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
            <v-menu v-if="moreMenu  && moreMenu.length > 0" bottom left>
                <template v-slot:activator="{ on }">
                    <v-btn dark icon v-on="on">
                        <v-icon>more_vert</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <div v-for="item in moreMenu" :key="item.key">
                        <v-divider v-if="item.type==='divider'"></v-divider>
                        <v-list-tile v-if="item.type==='item'" @click="item.function">
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
            <v-container fluid>
                
                <!-- ROUTER VIEW CONTENT -->
                <router-view 
                    @setToolbarMenuItems="onSetToolbarMenuItems"
                    @setMoreMenuItems="onSetMoreMenuItems" 
                    @setTitle="onSetTitle" 
                    @setProgress="onSetProgress"
                    @setBottomToolbar="onSetBottomToolbar"
                    @updateFavorites="onUpdateFavorites"
                    @showDialog="onShowDialog" 
                    @showSnackbar="onShowSnackbar">
                </router-view>

                <!-- BOTTOM BAR -->
                <rt-bottom-bar v-if="bottomBarEnabled"></rt-bottom-bar>

                <!-- APP CONFIRMATION DIALOG -->
                <rt-confirmation-dialog :properties="dialog"></rt-confirmation-dialog>

                <!-- APP PROGRESS DIALOG -->
                <rt-progress-dialog :properties="progress"></rt-progress-dialog>

                <!-- APP SNACKBAR -->
                <rt-snackbar :properties="snackbar"></rt-snackbar>

            </v-container>
        </v-content>

        <!-- STATUS BOTTOM TOOLBAR -->
        <rt-bottom-toolbar :properties="bottomToolbar"></rt-bottom-toolbar>

    </v-app>
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
    const BottomToolbar = require("@/components/app/BottomToolbar.vue").default;
    const ConfirmationDialog = require("@/components/app/ConfirmationDialog.vue").default;
    const ProgressDialog = require("@/components/app/ProgressDialog.vue").default;
    const Snackbar = require("@/components/app/Snackbar.vue").default;

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

        // Reset Title
        _setTitle(vm);

        // Enable / Disbale Bottom Bar
        vm.bottomBarEnabled = bottomBarPages.includes(vm.$route.name);

        // Reset Bottom Toolbar
        vm.bottomToolbar = {};

        // Update the Agency
        _updateAgency(vm, function() {

            // Set Title
            _setTitle(vm);

            // Prep the Database
            _prepDatabase(vm);

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
                _applyTheme(vm);
                if ( callback ) return callback();
            }

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
        if ( vm.agencyId && (force || (vm.agencyId && vm.agencyId !== vm.favorites.agencyId)) ) {
            favorites.get(vm.agencyId, function(err, favorites) {
                vm.favorites.favorites = favorites;
                vm.favorites.agencyId = vm.agencyId;
            });
        }
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
                agencyId: null,

                // Current Agency Name
                agencyName: undefined,

                // Current Agency Title
                agencyTitle: undefined,

                // Toolbar Title
                toolbarTitle: config.title,

                // Navigation Drawer Visiblity
                drawerVisible: null,

                // Favorites for the Menu
                favorites: {
                    agencyId: undefined,
                    favorites: []
                },

                 // Bottom Bar visibility flag
                bottomBarEnabled: bottomBarPages.includes(this.$router.currentRoute.name),

                // Toolbar Progress Properties
                toolbarProgress: {
                    isActive: false,
                    progress: undefined
                },

                // Toolbar Menu Items
                toolbarMenu: [],

                // More Menu Items
                moreMenu: [],

                // BottomToolbar Properties
                bottomToolbar: {},

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
                    type: undefined
                },

                // Snackbar Info
                snackbar: {
                    visible: false
                }

            }
        },


        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-drawer-menu': DrawerMenu,
            'rt-bottom-bar': BottomBar,
            'rt-bottom-toolbar': BottomToolbar,
            'rt-confirmation-dialog': ConfirmationDialog,
            'rt-progress-dialog': ProgressDialog,
            'rt-snackbar': Snackbar
        },


        // ==== COMPONENT METHODS ==== //
        methods: {

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
             * Set the Bottom Toolbar Properties
             * @param  {Object} properties Bottom Toolbar Properties
             */
            onSetBottomToolbar(properties) {
                let vm = this;
                Vue.nextTick(function() {
                    vm.bottomToolbar = properties;
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
    .toolbar-title {
        max-height: 40px;
        line-height: 20px;
        word-wrap: normal !important;
        white-space: normal !important;
    }
    .toolbar-progress {
        position: absolute;
        bottom: 0; 
        left: 0; 
        margin: -5px 0 0 0
    }
</style>