<template>
    <div class="container">
        
        <!-- Trips Table -->
        <md-card>
            
            <!-- Sticky: Card Header, Progress Bar, Table Header -->
            <div class="sticky">

                <!-- Trips Table Header -->
                <md-card-header class="md-card-header-bg rt-secondary">
                    
                    <!-- Header Buttons -->
                    <div class="md-card-header-button-container">
                        <md-button class="md-icon-button rt-secondary-text" @click="toggleFavorite" :disabled="updatingFavorite">
                            <md-icon v-if="isFavorite">star</md-icon>
                            <md-icon v-else>star_outline</md-icon>
                        </md-button>
                    </div>

                    <!-- Header Title -->
                    <div class="md-card-header-title">
                        <div class="md-card-header-title-icon">
                            <h2><md-icon>train</md-icon></h2>
                        </div>
                        <div class="md-card-header-title-name">
                            <h2 v-if="origin.name">{{ origin.name }} <md-icon>arrow_right</md-icon> {{ destination.name }}</h2>
                        </div>
                    </div>

                </md-card-header>

                <!-- Trip Table Progress Bar -->
                <div class="card-progress">
                    <div class="card-progress-line rt-primary" :style="{opacity: updatingStatus ? 0.4 : 1.0}"></div>
                    <div class="card-progress-subline rt-primary" :class="{'card-progress-subline-inc': updatingStatus}"></div>
                    <div class="card-progress-subline rt-primary" :class="{'card-progress-subline-dec': updatingStatus}"></div>
                </div>

            </div>
            <!-- /Sticky -->

            <!-- Station Departures -->
            <md-card-content>
                
                <!-- Loading Indicator -->
                <div v-if="!results" class="md-card-content-loading">
                    <md-progress-spinner md-mode="indeterminate" class="rt-primary-stroke"></md-progress-spinner>
                    <h3>Calculating Routes...</h3>
                </div>

                <!-- List of Trip Results -->
                <div v-for="(trip, index) in results" :key="'trip-' + trip.segments[0].trip.id">
                    <rt-trip-result-item :trip=trip></rt-trip-result-item>
                </div>

            </md-card-content>

        </md-card>

    </div>
</template>


<script>
    const core = require("right-track-core");
    const TripSearch = core.search.TripSearch;
    const DB = require("@/utils/db.js");
    const favorites = require("@/utils/favorites.js");
    const TripResultItem = require("@/components/trip/TripResultItem.vue").default;


    /**
     * Update the More Menu Items
     * @param  {Vue} vm    Vue Instance
     */
    function _updateMoreMenu(vm) {
        let moreMenuItems = [
            {
                key: 1,
                type: "item",
                title: "Test 1",
                function: function() {
                    console.log("Testing 1");
                }
            }
        ]
        vm.$emit('setMoreMenuItems', moreMenuItems);
    }

    /**
     * Check if the current Trip is a saved favorite
     * @param  {Vue}  vm   Vue Instance
     */
    function _updateFavorites(vm) {
        vm.updatingFavorite = true;
        favorites.get(vm.agencyId, function(err, favorites) {
            if ( err || favorites === undefined ) {
                vm.updatingFavorite = true;
                return;
            }
            vm.isFavorite = false;
            vm.updatingFavorite = false;
            for ( let i = 0; i < favorites.length; i++ ) {
                if ( favorites[i].type === 2 && favorites[i].origin.id === vm.origin.id && favorites[i].destination.id === vm.destination.id ) {
                    vm.isFavorite = true;
                }
            }
        });
    }

    /**
     * Update the Origin and Destination Stops
     * - Update the More Menu Items
     * - Update the Search Results
     * @param  {Vue} vm    Vue Instance
     */
    function _updateStops(vm) {
        let agencyId = vm.$route.params.agency;
        let originId = vm.$route.params.origin;
        let destinationId = vm.$route.params.destination;

        // Set Agency
        vm.agencyId = agencyId;
        vm.$emit('setAgencyId', vm.agencyId); 

        // Get Database
        DB.getDB(vm.agencyId, function(err, db) {
            if ( err ) {
                console.log(err);
            }

            // Get Origin and Destination
            core.query.stops.getStop(db, originId, function(err, origin) {
                core.query.stops.getStop(db, destinationId, function(err, destination) {
                    vm.origin = origin;
                    vm.destination = destination;

                    // Update the Title
                    vm.$emit('setTitle', vm.origin.name + " to " + vm.destination.name);

                    // Update the Favorite
                    _updateFavorites(vm);

                    // Update the More Menu Items
                    _updateMoreMenu(vm);

                    // Update the Results
                    _updateResults(vm);

                });
            });
        });
    }

    /**
     * Update the Search Results
     * @param  {Vue} vm    Vue Instance
     */
    function _updateResults(vm) {
        
        // Create TripSearch
        let search = new TripSearch(vm.origin, vm.destination);

        // Get Database
        DB.getDB(vm.agencyId, function(err, db) {
            if ( err ) {
                console.log(err);
            }

            // Start Search
            console.log("Starting Search...");
            search.search(db, function(err, results) {
                console.log("Results:");
                console.log(err);
                console.log(JSON.stringify(results[0]));
                vm.results = results;
            });
        });

    } 


    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: undefined,
                db: undefined,
                origin: {},
                destination: {},
                results: undefined,
                updatingStatus: false,
                updatingFavorite: true,
                isFavorite: false
            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-trip-result-item': TripResultItem
        },

        // ==== COMPONENT METHODS ==== //
        methods: {
            toggleFavorite: function() {
                let vm = this;
                if ( vm.isFavorite ) {
                    favorites.removeTrip(vm.agencyId, vm.origin, vm.destination, function(err) {
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
                    favorites.addTrip(vm.agencyId, vm.origin, vm.destination, function(err) {
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
            _updateStops(this);
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
                this.results = undefined;
                _updateStops(this);
            }

        }

    }
    
</script>


<style scoped>
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
        padding: 7px 10px 5px 10px;
        margin: 0;
    }
    @media (min-width: 960px) {
        .md-card-header {
            padding: 5px 10px;
        }
    }
    .md-card-header h2 {
        margin: 0;
        font-weight: normal !important;
    }
    .md-card-header-title {
        display: grid;
        grid-gap: 10px;
        grid-template-columns: 24px 1fr;
        grid-template-areas: "icon name";
        height: 100%;
        align-items: center;
    }
    .md-card-header-icon {
        grid-area: icon;
    }
    .md-card-header-name {
        grid-area: name;
    }

    .md-card-header-button-container {
        float: right;
        margin-top: 3px;
    }

    .md-card-content {
        padding: 0 !important;
        margin-top: -10px;
    }

    .md-card-content-loading {
        width: 100%;
        text-align: center;
        margin: 40px 5px 20px 5px;
        padding: 20px 5px 40px 5px;
    }

</style>