<template>
    <v-container class="page">

        <!-- Station Table -->
        <v-card>
            
            <!-- Station Departures Header -->
            <div class="departures-header">
                <div class="departures-header-item departures-header-time">Departure</div>
                <div class="departures-header-item departures-header-destination">Destination</div>
                <div class="departures-header-item departures-header-status">Status</div>
                <div class="departures-header-item departures-header-track">Track</div>
                <div class="departures-header-item departures-header-peak"></div>
            </div>

            <!-- Station Departures -->
            <template v-for="(departure, index) in departures">
                <rt-departure-item :departure="departure" :station="stop" :key="stop.name + '-departure-' + departure.trip.id + '-' + index"></rt-departure-item>
            </template>

        </v-card>

    </v-container>
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
                vm.updating = false;
                vm.$emit('showSnackbar', 'Could not get agency database.  Please try again.');
                return;
            }

            // Update the Stop
            core.query.stops.getStop(db, vm.$route.params.stop, function(err, stop) {
                if ( err ) {
                    console.error(err);
                    vm.updating = false;
                    vm.$emit('showSnackbar', 'Database Error.  Please try again.');
                    return;
                }

                if ( !stop ) {
                    vm.updating = false;
                    vm.$emit('showSnackbar', {
                        duration: 0,
                        message: 'Unknown Station requested.  Please select another Station.',
                        dismiss: 'Stations',
                        onDismiss: function() {
                            vm.$router.push({
                                name: "stations",
                                agency: vm.$router.currentRoute.params.agency
                            });
                        }
                    });
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

                // Update the Menu Items
                _updateMoreMenu(vm);
                _updateToolbarMenu(vm);

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
            vm.updating = false;
            if ( err ) {
                console.error(err);
                vm.$emit('showSnackbar', 'Could not update Station Feed.  Please try again later.');
                vm.feed = undefined;
                vm.departures = [];
                return;
            }
            vm.feed = feed;
            vm.departures = feed.departures;

            // Set Routes for Status Bar
            let routes = [];
            for ( let i = 0; i < feed.departures.length; i++ ) {
                let route = feed.departures[i].trip.route;
                if ( route && route.shortName && !routes.includes(route.shortName) ) {
                    routes.push(route.shortName);
                }
            }

            // Set messages for Status Bar
            let updated = new Date(feed.updated).toLocaleTimeString();
            let updatedDisplay = updated.split(':')[0] + ":" + updated.split(':')[1] + " " + updated.split(' ')[1];
            let messages = [{
                icon: "update",
                title: "Last Updated",
                subtitle: updatedDisplay
            }];

            // Update Status Bar
            vm.$emit('setStatusBar', {visible: true, transitDivisions: routes, messages: messages});

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
     * Update the Toolbar Menu Items
     * @param  {Vue} vm    Vue Instance
     */
    function _updateToolbarMenu(vm) {
        let toolbarMenuItems = [
            {
                key: 1,
                type: "icon",
                icon: vm.isFavorite ? "star" : "star_outline",
                disabled: vm.updatingFavorite,
                function() {
                    vm.toggleFavorite();
                }
            },
            {
                key: 2,
                type: "icon",
                icon: "refresh",
                disabled: vm.updating,
                function() {
                    vm.refresh();
                }
            }
        ]
        vm.$emit('setToolbarMenuItems', toolbarMenuItems);
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
                icon: "info",
                title: "Station Information",
                function: function() {
                    window.location = vm.stop.url;
                }
            },
            {
                key: 2,
                type: "item",
                icon: "place",
                title: "Station Map",
                function: function() {
                    window.location = "https://www.google.com/maps/search/?api=1&query=" + vm.stop.lat + "," + vm.stop.lon;
                }
            },
            {
                key: 3,
                type: "item",
                icon: "train",
                title: "Start Trip Search",
                function: function() {
                    vm.$router.push({
                        name: 'trips',
                        params: {
                            agency: vm.$router.currentRoute.params.agency,
                        },
                        query: {
                            origin: vm.stop.id,
                        }
                    });
                }
            }
        ];
        vm.$emit('setMoreMenuItems', moreMenuItems);
    }


    module.exports = {

        // ==== COMPONENT PROPS ==== //
        props: {
            title: {
                type: String,
                default: "Test"
            }
        },

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

        // ==== BEFORE ROUTE LEAVE ==== //
        beforeRouteLeave(to, from, next) {
            if ( TIMER_ID ) clearInterval(TIMER_ID);
            return next();
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
            },

            /**
             * Watchers for toolbar menu
             */
            updating() {
                _updateToolbarMenu(this);
                this.$emit('setProgress', this.updating);
            },
            updatingFavorite() {
                _updateToolbarMenu(this);
            },
            isFavorite() {
                _updateToolbarMenu(this);
            }

        }
        
    }
    
</script>


<style scoped>
    .page {
        margin-bottom: 40px;
    }

    .departures-header {
        padding: 5px 0;
        min-height: 50px;
        display: grid;
        grid-gap: 0 10px;
        grid-template-columns: 100px 1fr 75px 25px;
        grid-template-areas: "time destination destination peak" "time status track peak";
        background-color: #fff;
        border-bottom: 1px solid #eee;
    }
    @media (min-width: 960px) {
        .departures-header {
            grid-template-columns: 100px 1fr 100px 90px 25px;
            grid-template-areas: "time destination status track peak";
        }
    }

    .departures-header-item {
        font-weight: bold;
        font-size: 16px;
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
    .departures-header-peak {
        grid-area: peak;
        text-align: center;
    }
</style>