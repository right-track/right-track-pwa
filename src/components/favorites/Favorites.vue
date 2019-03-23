<template>
    <div class="content-container">
        
        <!-- Favorites Empty State -->
        <div v-show="showEmptyState">
            <md-empty-state md-icon="stars" md-label="Favorite Stations & Trips">
                <p class="md-empty-state-description">
                    Use the <md-icon>edit</md-icon> button below to add a favorite.
                </p>
                <p class="md-empty-state-description">
                    A <strong>Station</strong> <md-icon>access_time</md-icon> displays real-time status information 
                    for upcoming departures from a single stop.
                    A <strong>Trip</strong> <md-icon>train</md-icon> displays departure and arrival times between 
                    two stops.
                </p>

                <div class="favorites-login" v-show="showLogin">
                    <p class="md-empty-state-description">
                        Use your <strong>Right Track Account</strong> to sync your favorites across devices.
                    </p>

                    <div class="md-layout" style="width: 100%">
                        <div class="md-layout-item md-size-40 md-small-size-100" style="padding: 0 5px;">
                            <md-button class="md-primary md-flat" @click="login"><md-icon>person_outline</md-icon> Log In</md-button>
                        </div>
                        <div class="md-layout-item md-size-60 md-small-size-100" style="padding: 0 5px;">
                            <md-button class="md-primary md-flat" @click="register"><md-icon>person_add</md-icon> Create Account</md-button>
                        </div>
                    </div>
                </div>
            </md-empty-state>
        </div>


        <!-- Favorites List -->
        <div v-show="showFavorites">
            <md-card class="favorites-card">
                <md-card-header class="md-card-header-secondary">
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


        <!-- Favorites FAB -->
        <md-speed-dial md-event="click" md-effect="scale" md-direction="top">
            <md-speed-dial-target class="favorites-fab">
                <md-icon class="md-morph-initial">edit</md-icon>
                <md-icon class="md-morph-final">close</md-icon>
            </md-speed-dial-target>
            <md-speed-dial-content class="favorites-fab-content">
                <md-button class="md-icon-button favorites-fab-content-button">
                    <md-icon>remove_circle</md-icon>
                    <md-tooltip class="favorites-fab-content-tooltip" md-direction="left" md-delay="1000">Remove Favorites</md-tooltip>
                </md-button>
                <md-button class="md-icon-button favorites-fab-content-button">
                    <md-icon>train</md-icon>
                    <md-tooltip class="favorites-fab-content-tooltip" md-direction="left" md-delay="1000">Add Trip</md-tooltip>
                </md-button>
                <md-button class="md-icon-button favorites-fab-content-button">
                    <md-icon>access_time</md-icon>
                    <md-tooltip class="favorites-fab-content-tooltip" md-direction="left" md-delay="1000">Add Station</md-tooltip>
                </md-button>
            </md-speed-dial-content>
        </md-speed-dial>

    </div>
</template>


<script>
    const user = require("../../utils/user.js");
    const favorites = require("../../utils/favorites.js");
    const cache = require("../../utils/cache.js");
    const FavoritesList = require("./FavoritesList.vue").default;

    // More Menu Items
    const moreMenuItems = [];


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
                vm.favorites = favs;
                let hasFavorites = favs.length > 0;
                vm.showEmptyState = !hasFavorites;
                vm.showFavorites = hasFavorites;
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
                showLogin: false
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

            // Set More Menu Items and Agency Information
            vm.$emit('setMoreMenuItems', moreMenuItems);
            vm.$emit('setAgencyId', vm.agencyId);

            // Set Logged In Status
            user.isLoggedIn(function(isLoggedIn) {
                vm.showLogin = !isLoggedIn;
            });

            // Display Favorites
            _displayFavorites(vm);
        }

    }

</script>


<style scoped>
    .md-empty-state {
        color: #444;
        max-width: 600px;
    }
    .favorites-login .md-button {
        width: 90%;
    }

    .favorites-card-content {
        padding-bottom: 0 !important;
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