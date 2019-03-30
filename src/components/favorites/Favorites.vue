<template>
    <div class="content-container">
        
        <!-- Favorites Empty State -->
        <div v-show="showEmptyState">
            <md-empty-state md-icon="stars" md-label="Favorite Trips & Stations">
                <p class="md-empty-state-description">
                    Use the <md-icon>edit</md-icon> button below to add a favorite.
                </p>
                <p class="md-empty-state-description">
                    A <strong>Trip</strong> <md-icon>train</md-icon> displays departure and arrival times between 
                    two stops. A <strong>Station</strong> <md-icon>access_time</md-icon> displays real-time status 
                    information for upcoming departures from a single stop.
                </p>

                <div class="favorites-login" v-show="showLogin">
                    <p class="md-empty-state-description">
                        Use your <strong>Right Track Account</strong> to sync your favorites across devices.
                    </p>

                    <div class="md-layout" style="width: 100%">
                        <div class="md-layout-item md-size-40 md-small-size-100" style="padding: 0 5px;">
                            <md-button class="md-primary md-flat rt-primary-fg" @click="login"><md-icon>person_outline</md-icon> Log In</md-button>
                        </div>
                        <div class="md-layout-item md-size-60 md-small-size-100" style="padding: 0 5px;">
                            <md-button class="md-primary md-flat rt-primary-fg" @click="register"><md-icon>person_add</md-icon> Create Account</md-button>
                        </div>
                    </div>
                </div>
            </md-empty-state>
        </div>


        <!-- Show Favorites -->
        <div v-show="showFavorites">
            
            <!-- Favorites List -->    
            <md-card class="favorites-card">
                <md-card-header class="md-card-header-bg rt-secondary">
                    <div class="md-title">
                        <md-icon>star</md-icon>
                        Favorites
                    </div>
                </md-card-header>
                <md-card-content class="favorites-card-content">
                    <rt-favorites-list :favorites="favorites"></rt-favorites-list>
                </md-card-content>
            </md-card>

            <!-- Database Info -->
            <div v-if="databaseInfo" class="db-info-container">
                <p class="light">
                    <strong>Database Version {{ databaseInfo.version }}</strong><br />
                    Published: {{ databaseInfo.gtfs_publish_date }}<br />
                    Compiled: {{ databaseInfo.compile_date }}
                </p>
            </div>

        </div>

        
        <!-- Favorites FAB -->
        <md-speed-dial md-event="click" md-effect="scale" md-direction="top">
            <md-speed-dial-target id="favorites-fab" class="favorites-fab rt-primary" :disabled="!selectDialogProps.stops">
                <md-icon class="md-morph-initial">edit</md-icon>
                <md-icon class="md-morph-final">close</md-icon>
            </md-speed-dial-target>
            <md-speed-dial-content class="favorites-fab-content">
                <md-button class="md-icon-button rt-primary-fg">
                    <md-icon>delete</md-icon>
                    <md-tooltip md-direction="left" md-delay="1000">Remove Favorites</md-tooltip>
                </md-button>
                <md-button class="md-icon-button rt-primary-fg">
                    <md-icon>shuffle</md-icon>
                    <md-tooltip md-direction="left" md-delay="1000">Reorder Favorites</md-tooltip>
                </md-button>
                <md-button class="md-icon-button rt-primary-fg" @click="selectStation">
                    <span class="favorites-fab-button-add rt-secondary">+</span>
                    <md-icon>access_time</md-icon>
                    <md-tooltip md-direction="left" md-delay="1000">Add Station</md-tooltip>
                </md-button>
                <md-button class="md-icon-button rt-primary-fg" @click="selectTrip">
                    <span class="favorites-fab-button-add rt-secondary">+</span>
                    <md-icon>train</md-icon>
                    <md-tooltip md-direction="left" md-delay="1000">Add Trip</md-tooltip>
                </md-button>
            </md-speed-dial-content>
        </md-speed-dial>


        <!-- SELECT STATION DIALOG -->
        <rt-stop-selection-dialog :properties="selectDialogProps" @stopSelected="onStopSelected"></rt-stop-selection-dialog>


    </div>
</template>


<script>
    const core = require("right-track-core");
    const user = require("@/utils/user.js");
    const favorites = require("@/utils/favorites.js");
    const cache = require("@/utils/cache.js");
    const DB = require("@/utils/db.js");
    const FavoritesList = require("@/components/favorites/FavoritesList.vue").default;
    const StopSelectionDialog = require("@/components/StopSelectionDialog.vue").default;


    /**
     * Retrieve and Display User Favorites
     * @param  {Vue} vm Vue Instance
     */
    function _displayFavorites(vm) {
        favorites.get(vm.agencyId, function(err, favs) {
            if ( err ) {
                vm.$emit('showSnackar', err);
                vm.showEmptyState = false;
                vm.showFavorites = false;
            }
            else {
                if ( favs === undefined ) {
                    favs = [];
                }
                vm.favorites = favs;
                vm.showEmptyState = favs.length === 0;
                vm.showFavorites = !vm.showEmptyState;
            }
        });
    }

    /**
     * Display the DB Version info
     * @param  {Vue} vm Vue Instance
     */
    function _displayDBInfo(vm) {
        DB.getDB(vm.agencyId, function(err, db) {
            if ( !err ) {
                db.get("SELECT compile_date, gtfs_publish_date, start_date, end_date, version, notes FROM rt_about;", function(err, info) {
                    if ( !err ) {
                        vm.databaseInfo = info;
                    }
                });
            }
        });
    }

    /**
     * Get the Stops from the Agency DB
     * @param  {Vue}      vm       Vue Instance
     * @param  {Function} callback Callback function(stops)
     */
    function _getStops(vm, callback) {
        let agencyID = vm.$route.params.agency;
        let db = DB.getDB(agencyID, function(err, db) {
            if ( err ) {
                console.error(err);
                return;
            }
            core.query.stops.getStops(db, function(err, stops) {
                if ( err ) {
                    console.error(err);
                    return;
                }
                return callback(stops);
            });
        });
    }


    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: undefined,
                favorites: [],
                showEmptyState: false,
                showFavorites: false,
                showLogin: false,
                databaseInfo: undefined,
                selectDialogProps: {
                    visible: false,
                    type: undefined,
                    stops: undefined
                }
            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-favorites-list': FavoritesList,
            'rt-stop-selection-dialog': StopSelectionDialog
        },

        // ==== COMPONENT FUNCTIONS ==== //
        methods: {

            /**
             * Redirect to the Login page
             */
            login() {
                this.$router.push({
                    name: "login",
                    query: {
                        agency: this.agencyId,
                        src: this.$route.path
                    }
                });
            },

            /**
             * Redirect to the Registration page
             */
            register() {
                this.$router.push({
                    name: "register",
                    query: {
                        agency: this.agencyId,
                        src: this.$route.path
                    }
                });
            },

            /**
             * Select Stop for Favorite Station
             */
            selectStation() {
                this.selectDialogProps.type = "station";
                this.selectDialogProps.visible = true;
            },

            /**
             * Select the Stops for Favorite Trip
             * @return {[type]} [description]
             */
            selectTrip() {
                this.selectDialogProps.type = "trip";
                this.selectDialogProps.origin = undefined;
                this.selectDialogProps.visible = true;
            },
            
            /**
             * Handle the return of a selected Stop
             * @param  {String} type Stop Type
             * @param  {Stop} stop Selected Station / Origin
             */
            onStopSelected(type, stop1, stop2) {
                this.selectDialogProps.visible = false;
                
                if ( type === "station" ) {
                    console.log("ADD FAVORITE STATION: " + stop1.name)
                }

                else if ( type === "trip" ) {
                    console.log("ADD FAVORITE TRIP: " + stop1.name + " --> " + stop2.name);
                }

            }

        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            let vm = this;

            // Set Agency ID
            vm.agencyId = vm.$route.params.agency;

            // Set More Menu Items
            vm.$emit('setMoreMenuItems', []);

            // Set Logged In Status
            user.isLoggedIn(function(isLoggedIn) {
                vm.showLogin = !isLoggedIn;
            });

            // Display Favorites
            _displayFavorites(vm);

            // Display Database Info
            _displayDBInfo(vm);

            // Get the Stops for the selection dialog
            _getStops(vm, function(stops) {
                vm.selectDialogProps.stops = stops;
            });

        }

    }

</script>


<style scoped>
    .md-empty-state {
        color: #444;
        max-width: 500px;
    }
    .favorites-login .md-button {
        width: 90%;
    }

    .favorites-card-content {
        padding-bottom: 0 !important;
    }

    .db-info-container {
        width: 100%;
        margin: 20px 0;
        text-align: center;
    }

    .favorites-fab-content .md-button {
        background-color: #fff;
    }
    .favorites-fab-button-add {
        position: fixed;
        top: 4px;
        right: 5px;
        font-size: 11px;
        width: 13px;
        height: 13px;
        border-radius: 25px;
        z-index: 999;
    }

    @media screen and (min-width: 0px) and (max-width: 600px) {
        .favorites-fab {
            position: fixed;
            right: 15px;
            bottom: 65px;
        }
        .favorites-fab-content {
            position: fixed;
            right: 22px;
            bottom: 130px;
        }
    }
    @media screen and (min-width: 601px) {
        .favorites-fab {
            position: fixed;
            right: 25px;
            bottom: 25px;
        }
        .favorites-fab-content {
            position: fixed;
            right: 32px;
            bottom: 90px;
        }
    }
</style>