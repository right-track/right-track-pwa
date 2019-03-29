<template>
    <div class="fixed-content-container">

        <!-- Station Table -->
        <md-card>
            
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
                <h2><md-icon>place</md-icon> {{ stop.name }}</h2>

            </md-card-header>

            <!-- Station Table Progress Bar -->
            <div class="card-progress">
                <div class="card-progress-line rt-primary" :style="{opacity: updating ? 0.4 : 1.0}"></div>
                <div class="card-progress-subline rt-primary" :class="{'card-progress-subline-inc': updating}"></div>
                <div class="card-progress-subline rt-primary" :class="{'card-progress-subline-dec': updating}"></div>
            </div>

            <!-- Station Departures Header -->
            <div class="departures-header-wrapper-small md-small-show-grid">
                <div class="departures-header-item departures-header-item-center">Departure</div>
                <div class="departures-header-item">
                    Destination<span class="md-xsmall-hide"> &amp; Status</span>
                    <span class="departures-header-item-track-small">Track</span>
                </div>
            </div>
            <div class="departures-header-wrapper md-small-hide-grid">
                <div class="departures-header-item departures-header-item-center">Departure</div>
                <div class="departures-header-item">Destination</div>
                <div class="departures-header-item departures-header-item-center">Status</div>
                <div class="departures-header-item departures-header-item-center">Track</div>
            </div>

            <!-- Station Departures -->
            <md-card-content>
                <rt-departure-list :departures="departures"></rt-departure-list>
            </md-card-content>

        </md-card>

    </div>
</template>


<script>
    const core = require("right-track-core");
    const cache = require("@/utils/cache.js");
    const DB = require("@/utils/db.js");
    const favorites = require("@/utils/favorites.js");
    const StationDepartureList = require("@/components/station/StationDepartureList.vue").default;


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
        favorites.get(vm.agencyId, function(err, favorites) {
            if ( err || favorites === undefined ) {
                vm.updatingFavorite = true;
                return;
            }
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
                    console.log("Station Info");
                }
            },
            {
                key: 2,
                type: "item",
                title: "Station Map",
                function: function() {
                    console.log("Station Map");
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
                updatingFavorite: false,
                isFavorite: false
            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-departure-list': StationDepartureList
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
                console.log("TOGGLE FAVORITE");
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

    .md-card-header h2 {
        margin: 0;
    }
    .md-card-header h3 {
        margin: 5px 0 -5px 0;
        opacity: 0.6;
        font-size: 12px;
    }
    .md-card-header h3 .md-icon {
        font-size: 16px !important;
        font-weight: 200 !important;
    }

    .md-card-header-button-container {
        float: right;
        margin-top: -8px;
    }

    .departures-header-wrapper {
        display: grid;
        grid-template-columns: 120px auto 150px 100px;
        margin: 5px -15px 5px -25px;
    }
    .departures-header-wrapper-small {
        display: grid;
        grid-template-columns: 110px auto;
        margin: 5px -15px 5px -15px;
    }
    .departures-header-item {
        padding: 5px;
        font-weight: bold;
        font-size: 16px;
    }
    .departures-header-item-center {
        text-align: center;
    }
    .departures-header-item-track-small {
        float: right;
        margin-right: 15px;
    }

    .md-card-content {
        max-height: calc(100vh - 240px);
        overflow: auto;
        margin: 5px -25px;
        padding: 0 10px !important;
    }
</style>