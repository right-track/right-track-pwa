
<template>
    <div class="container">

        <!-- Station Table -->
        <md-card>
            
            <!-- Sticky: Card Header, Progress Bar, Table Header -->
            <div class="sticky">

                <!-- Station Table Header -->
                <md-card-header class="md-card-header-bg rt-secondary">
                    
                    <!-- Header Buttons -->
                    <div class="md-card-header-button-container">
                        <md-button class="md-icon-button rt-secondary-text" @click="toggleFavorite" :disabled="updatingFavorite">
                            <md-icon v-if="isFavorite">star</md-icon>
                            <md-icon v-else>star_outline</md-icon>
                        </md-button>
                        <md-button class="md-icon-button rt-secondary-text" @click="refresh" :disabled="updating">
                            <md-icon>refresh</md-icon>
                        </md-button>
                    </div>

                    <!-- Header Title -->
                    <div class="md-card-header-title">
                        <div class="md-card-header-title-icon">
                            <h2><md-icon>access_time</md-icon></h2>
                        </div>
                        <div class="md-card-header-title-name">
                            <h2>{{ stop.name }}</h2>
                        </div>
                    </div>

                </md-card-header>

                <!-- Station Table Progress Bar -->
                <div class="card-progress">
                    <div class="card-progress-line rt-primary" :style="{opacity: updating ? 0.4 : 1.0}"></div>
                    <div class="card-progress-subline rt-primary" :class="{'card-progress-subline-inc': updating}"></div>
                    <div class="card-progress-subline rt-primary" :class="{'card-progress-subline-dec': updating}"></div>
                </div>

                <!-- Station Departures Header -->
                <div class="departures-header">
                    <div class="departures-header-item departures-header-time">Departure</div>
                    <div class="departures-header-item departures-header-destination">Destination</div>
                    <div class="departures-header-item departures-header-status">Status</div>
                    <div class="departures-header-item departures-header-track">Track</div>
                </div>

            </div>
            <!-- /Sticky -->

            <!-- Station Departures -->
            <md-card-content>
                <div v-for="(departure, index) in departures" :key="stop.name + '-departure-' + index">
                    <rt-departure-item :departure="departure" :station="stop"></rt-departure-item>
                </div>
            </md-card-content>

        </md-card>

        <div class="transit-status-container rt-secondary">
            <div class="transit-status-border rt-primary"></div>
            <div class="transit-status-content"></div>
        </div>

    </div>
</template>


<script>
    const core = require("right-track-core");
    const cache = require("@/utils/cache.js");
    const DB = require("@/utils/db.js");
    const favorites = require("@/utils/favorites.js");
    const StationDepartureItem = require("@/components/station/StationDepartureItem.vue").default;

    let TIMER_ID = undefined;


    /**
     * Update the Station Stop
     * - Get Stop ID from route path
     * - Get Stop Info from DB
     * - Update the Feed
     * - Update the More Menu Items
     * @param  {Vue} vm    Vue Instance
     */
    function _updateStop(vm) {

        // Set updating flag
        vm.updating = true;

        // Update Agency
        vm.agencyId = vm.$route.params.agency;

        // Get the Databse
        DB.getDB(vm.agencyId, function(err, db) {
            if ( err ) {
                console.error(err);
                vm.$emit('showSnackbar', 'Could not get agency database.  Please try again.');
                return;
            }

            // Update the Stop
            core.query.stops.getStop(db, vm.$route.params.stop, function(err, stop) {
                if ( err ) {
                    console.error(err);
                    vm.$emit('showSnackbar', 'Database Error.  Please try again.');
                    return;
                }

                // Update the stop reference
                vm.stop = stop;

                // Update the Title
                vm.$emit('setTitle', vm.stop.name);

                // Update the Feed
                _updateFeed(vm);

                // Check for favorites
                _updateFavorites(vm);

                // Update the More Menu Items
                _updateMoreMenu(vm);

                // Set auto-update timer
                if ( TIMER_ID ) {
                    clearInterval(TIMER_ID);
                }
                TIMER_ID = setInterval(function(){ _updateFeed(vm) }, 60000);

            });

        });
    }


    /**
     * Update the Station Feed
     * @param  {Vue} vm    Vue Instance
     */
    function _updateFeed(vm) {
        console.log("Updating Feed...");
        vm.updating = true;
        cache.getStationFeed(vm.agencyId, vm.stop.id, function(err, feed) {
            if ( err ) {
                console.error(err);
                vm.$emit('showSnackbar', 'Could not update Station Feed.  Please try again later.');
                vm.updating = false;
                return;
            }
            vm.feed = feed;
            vm.departures = feed.departures;
            vm.updating = false;
        });
    }


    /**
     * Check if the current Station is a saved favorite
     * @param  {Vue}  vm   Vue Instance
     */
    function _updateFavorites(vm) {
        vm.updatingFavorite = true;
        favorites.get(vm.agencyId, function(err, favorites) {
            if ( err || favorites === undefined ) {
                vm.updatingFavorite = true;
                return;
            }
            vm.updatingFavorite = false;
            vm.isFavorite = false;
            for ( let i = 0; i < favorites.length; i++ ) {
                if ( favorites[i].type === 1 && favorites[i].stop.id === vm.stop.id ) {
                    vm.isFavorite = true;
                }
            }
        });
    }


    /**
     * Update the More Menu Items
     * @param  {Vue} vm    Vue Instance
     */
    function _updateMoreMenu(vm) {
        let moreMenuItems = [
            {
                key: 1,
                type: "item",
                title: "Station Information",
                function: function() {
                    window.location = vm.stop.url;
                }
            },
            {
                key: 2,
                type: "item",
                title: "Station Map",
                function: function() {
                    window.location = "https://www.google.com/maps/search/?api=1&query=" + vm.stop.lat + "," + vm.stop.lon;
                }
            }
        ];
        vm.$emit('setMoreMenuItems', moreMenuItems);
    }


    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: undefined,
                stop: {},
                feed: undefined,
                departures: [],
                updating: false,
                updatingFavorite: true,
                isFavorite: false
            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-departure-item': StationDepartureItem
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Refresh the Station Feed
             */
            refresh() {
                let vm = this;
                vm.updating = true;
                setTimeout(function() {
                    _updateFeed(vm);
                }, 500);
            },

            /**
             * Toggle the Station Favorite
             */
            toggleFavorite() {
                let vm = this;
                if ( vm.isFavorite ) {
                    favorites.removeStation(vm.agencyId, vm.stop, function(err) {
                        if ( err ) {
                            console.error(err);
                            vm.$emit('showSnackbar', 'Could not remove favorite. Please try again later.');
                        }
                        else {
                            vm.isFavorite = false;
                            vm.$emit('updateFavorites');
                            vm.$emit('showSnackbar', 'Favorite removed');
                        }
                    });
                }
                else {
                    favorites.addStation(vm.agencyId, vm.stop, function(err) {
                        if ( err ) {
                            console.error(err);
                            vm.$emit('showSnackbar', 'Could not add favorite. Please try again later.');
                        }
                        else {
                            vm.isFavorite = true;
                            vm.$emit('updateFavorites');
                            vm.$emit('showSnackbar', 'Favorite added');
                        }
                    });
                }
            }

        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            _updateStop(this);
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {

            /**
             * Watch for route changes
             * - Update the Stop
             * @param  {Route} to To Route
             * @param  {Route} from From Route
             */
            $route (to, from) {
                _updateStop(this);
            }

        }


    }
    
</script>


<style scoped>
    .transit-status-container {
        position: fixed;
        left: 0;
        bottom: 0;
        margin: 0;
        width: 100%;
        height: 56px;
        z-index: 600;
    }
    @media (min-width: 600px) {
        .transit-status-container {
            padding-left: 230px;
        }
    }

    .transit-status-border {
        height: 2px;
        width: 100%;
    }


    .container {
        margin: 0 auto;
        padding: 0 0 90px 0;
        max-width: 650px;
    }
    @media (min-width: 960px) {
        .container {
            padding-top: 40px;
        }
    }

    div.sticky {
        position: -webkit-sticky;
        position: sticky;
        top: -5px;
        z-index: 500;
    }

    .md-card {
        margin: -5px 0 0 0 !important;
        padding: 0 !important;
    }

    .md-card-header {
        height: 56px;
        padding: 12px 10px 10px 10px;
        margin: 0;
    }
    @media (min-width: 960px) {
        .md-card-header {
            padding: 0 10px;
        }
    }
    .md-card-header h2 {
        margin: 0;
        font-weight: normal !important;
    }
    .md-card-header-title {
        display: grid;
        grid-gap: 0 10px;
        grid-template-columns: 24px 1fr;
        grid-template-areas: "icon name";
        align-items: center;
        height: 100%;
    }
    .md-card-header-icon {
        grid-area: icon;
    }
    .md-card-header-name {
        grid-area: name;
    }

    .md-card-header-button-container {
        float: right;
        margin-top: -2px;
    }
    @media (min-width: 960px) {
        .md-card-header-button-container {
            margin-top: 8px;
        }
    }

    .departures-header {
        margin: 5px 0 -5px 0;
        padding: 5px 0;
        display: grid;
        grid-gap: 0 10px;
        grid-template-columns: 100px 1fr 75px;
        grid-template-areas: "time destination destination" "time status track";
        background-color: #fff;
        border-bottom: 1px solid #eee;
    }
    @media (min-width: 960px) {
        .departures-header {
            grid-template-columns: 100px 1fr 100px 90px;
            grid-template-areas: "time destination status track";
        }
    }

    .departures-header {
        height: 50px;
    }
    .departures-header-item {
        font-weight: bold;
        font-size: 16px;
        padding-left: 5px;
        margin-top: auto;
        margin-bottom: auto;
    }
    .departures-header-time {
        grid-area: time;
        text-align: center;
    }
    .departures-header-destination {
        grid-area: destination;
    }
    .departures-header-status {
        grid-area: status;
    }
    .departures-header-track {
        grid-area: track;
        text-align: center;
    }

    .md-card-content {
        margin: 5px 0;
        padding: 0 !important;
        background-color: rgba(0, 0, 0, 0.5);
    }
</style>