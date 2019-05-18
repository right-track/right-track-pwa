<template>
    <v-container class="container">
        
        <!-- Favorites Empty State -->
        <div v-show="showEmptyState" class="empty-state">
            <v-icon class="empty-state-icon">stars</v-icon>

            <p class="subheading">
                Use the <v-icon>edit</v-icon> button below to add a favorite.
            </p>
            <p class="subheading">
                A <strong>Trip</strong> <v-icon>train</v-icon> displays departure and arrival times between 
                two stops. A <strong>Station</strong> <v-icon>access_time</v-icon> displays real-time status 
                information for upcoming departures from a single stop.
            </p>

            <div class="favorites-login" v-show="showLogin">
                <p class="subheading">
                    Use your <strong>Right Track Account</strong> to sync your favorites across devices.
                </p>

                <div class="button-container">
                    <div class="button-login">
                        <v-btn @click="login" color="primary">
                            <v-icon>person_outline</v-icon> Log In
                        </v-btn>
                    </div>
                    <div class="button-register">
                        <v-btn @click="register" color="primary" outline>
                            <v-icon>person_add</v-icon> Create Account
                        </v-btn>
                    </div>
                </div>
            </div>
        </div>


        <!-- Show Favorites -->
        <div v-show="showFavorites">
            
            <!-- Favorites List -->    
            <v-card class="favorites-card">
                <v-card-title class="headline secondary-bg">
                    <v-icon>star</v-icon>&nbsp;&nbsp;Favorites
                </v-card-title>
                <rt-favorites-list :favorites="favorites"></rt-favorites-list>
            </v-card>

            <!-- Database Info -->
            <div v-if="databaseInfo" class="db-info-container">
                <p class="font-weight-light">
                    <strong>Database Version:</strong> {{ databaseInfo.version }}<br />
                    <strong>Published:</strong> {{ databaseInfo.gtfs_publish_date_formatted }}
                </p>
            </div>

        </div>

        
        <!-- Favorites FAB -->
        <v-speed-dial
            v-model="fab"
            class="favorites-fab"
            fixed direction="top"
            transition="slide-y-reverse-transition">
            
            <template v-slot:activator>
                <v-btn v-model="fab" class="primary-bg" fab>
                    <v-icon>edit</v-icon>
                    <v-icon>close</v-icon>
                </v-btn>
            </template>
            
            <v-btn @click="selectTrip" class="primary-fg" small fab>
                <v-icon>train</v-icon>
            </v-btn>
            <v-btn @click="selectStation" class="primary-fg" small fab>
                <v-icon>access_time</v-icon>
            </v-btn>
            <v-btn class="primary-fg" small fab>
                <v-icon>shuffle</v-icon>
            </v-btn>
            <v-btn color="error" small fab>
                <v-icon>delete</v-icon>
            </v-btn>

        </v-speed-dial>
        

        <!-- SELECT STATION DIALOG -->
        <rt-stop-selection-dialog :properties="selectDialogProps" @stopSelected="onStopSelected"></rt-stop-selection-dialog>


    </v-container>
</template>


<script>
    const core = require("right-track-core");
    const user = require("@/utils/user.js");
    const favorites = require("@/utils/favorites.js");
    const cache = require("@/utils/cache.js");
    const DB = require("@/utils/db.js");
    const FavoritesList = require("@/components/favorites/FavoritesList.vue").default;
    const StopSelectionDialog = require("@/components/StopSelectionDialog.vue").default;


    // MORE MENU ITEMS
    const MORE_MENU_ITEMS = function(vm) {
        return [
            {
                key: 1,
                type: "item",
                icon: "refresh",
                title: "Refresh Favorites",
                function: function() {
                    vm.forceUpdate();
                }
            },
            {
                key: 2,
                type: "item",
                icon: "save_alt",
                title: "Check for DB Update",
                function: function() {
                    vm.$emit('checkUpdate');
                }
            }
        ]
    }


    /**
     * Retrieve and Display User Favorites
     * @param {Vue}     vm      Vue Instance
     * @param {boolean} [force] Force a refresh
     */
    function _displayFavorites(vm, force) {
        favorites.get(vm.agencyId, force, function(err, favs) {
            if ( err ) {
                vm.$emit('showSnackar', err);
                vm.showEmptyState = false;
                vm.showFavorites = false;
            }
            else {
                if ( force ) {
                    vm.$emit('showSnackbar', 'Favorites updated');
                }
                if ( favs === undefined ) {
                    favs = [];
                }
                vm.favorites = favs;
                vm.showEmptyState = favs.length === 0;
                vm.showFavorites = !vm.showEmptyState;
                vm.$emit('updateFavorites');
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
                        let p = info.gtfs_publish_date.toString();
                        vm.databaseInfo.gtfs_publish_date_formatted = p.substring(4,6) + "/" + p.substring(6,8) + "/" + p.substring(0,4);
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
                fab: false,
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
             * Force a favorites update
             */
            forceUpdate() {
                _displayFavorites(this, true);
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
                let vm = this;
                
                if ( type === "station" ) {
                    favorites.addStation(vm.agencyId, stop1, _return);
                }

                else if ( type === "trip" ) {
                    favorites.addTrip(vm.agencyId, stop1, stop2, _return);
                }

                /**
                 * Update the favorites once added
                 * @param  {Error} err        Error
                 * @param  {Array} favorites  List of favorites
                 */
                function _return(err, favorites) {
                    if ( err ) {
                        console.error(err);
                        vm.$emit('showSnackbar', 'Could not add favorite. Please try again.');
                        return;
                    }
                    vm.favorites = favorites;
                    vm.showEmptyState = false;
                    vm.showFavorites = true;
                    vm.$emit('updateFavorites');
                }

            },

            /**
             * Start the update of the Agency database
             */
            startDBUpdate() {
                this.$emit('startUpdate');
            }

        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            let vm = this;

            // Set Agency ID
            vm.agencyId = vm.$route.params.agency;

            // Set Logged In Status
            user.isLoggedIn(function(isLoggedIn) {
                vm.showLogin = !isLoggedIn;
                vm.$emit('setMoreMenuItems', isLoggedIn ? MORE_MENU_ITEMS(vm) : []);
                _displayFavorites(vm);
            });

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
    .container {
        padding-bottom: 40px;
    }

    .empty-state {
        max-width: 500px;
        text-align: center;
        margin: auto;
    }
    .empty-state * {
        color: #666;
    }
    .empty-state-icon {
        font-size: 160px;
    }

    .button-container {
        display: grid;
        grid-gap: 10px;
        grid-template-columns: 1fr;
        grid-template-areas: "login" "register";
    }
    @media (min-width: 600px) {
        .button-container {
            grid-template-columns: 1fr 1fr;
            grid-template-areas: "register login";
        }
    }
    .button-login {
        grid-area: login;
        text-align: center;
    }
    .button-register {
        grid-area: register;
        text-align: center;
    }
    .button-container .v-btn {
        width: 90%;
        max-width: 300px;
    }

    .db-info-container {
        width: 100%;
        margin: 20px 0;
        text-align: center;
    }

    .favorites-fab {
        position: fixed;
        bottom: 70px;
        right: 15px;
    }
    @media (min-width: 960px) {
        .favorites-fab {
            bottom: 15px;
        }
    }
</style>