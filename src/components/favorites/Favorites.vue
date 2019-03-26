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


        <!-- Favorites List -->
        <div v-show="showFavorites">
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
        </div>


        <!-- Database Info -->
        <div v-if="databaseInfo" class="db-info-container">
            <p class="light">
                <strong>Database Version {{ databaseInfo.version }}</strong><br />
                Published: {{ databaseInfo.gtfs_publish_date }}<br />
                Compiled: {{ databaseInfo.compile_date }}
            </p>
        </div>


        <!-- Favorites FAB -->
        <md-speed-dial md-event="click" md-effect="scale" md-direction="top">
            <md-speed-dial-target class="favorites-fab rt-primary">
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
                <md-button class="md-icon-button rt-primary-fg">
                    <md-icon>access_time</md-icon>
                    <md-tooltip md-direction="left" md-delay="1000">Add Station</md-tooltip>
                </md-button>
                <md-button class="md-icon-button rt-primary-fg">
                    <md-icon>train</md-icon>
                    <md-tooltip md-direction="left" md-delay="1000">Add Trip</md-tooltip>
                </md-button>
            </md-speed-dial-content>
        </md-speed-dial>

    </div>
</template>


<script>
    const user = require("@/utils/user.js");
    const favorites = require("@/utils/favorites.js");
    const cache = require("@/utils/cache.js");
    const DB = require("@/utils/db.js");
    const FavoritesList = require("@/components/favorites/FavoritesList.vue").default;


    /**
     * Retrieve and Display User Favorites
     * @param  {Vue} vm Vue Instance
     */
    function _displayFavorites(vm) {
        favorites.getFavorites(vm.agencyId, function(err, favs) {
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


    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: undefined,
                favorites: [],
                showEmptyState: false,
                showFavorites: false,
                showLogin: false,
                databaseInfo: undefined
            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-favorites-list': FavoritesList
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