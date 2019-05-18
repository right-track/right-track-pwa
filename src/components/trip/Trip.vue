<template>
    <v-container class="container">

        <!-- List of Trip Results -->
        <template v-for="(trip, index) in results">
            <v-card :id="'trip-result-card-' + index" class="trip-result-card" :key="'trip-' + index">
                <rt-trip-result-item 
                    :trip="trip" 
                    :highlight="index === resultsHighlightIndex"
                    :statusFeeds="statusFeeds">
                </rt-trip-result-item>
            </v-card>
        </template>
        

        <!-- No Results Found -->
        <v-fade-transition>
            <div v-if="results && results.length === 0" class="trip-results-none">
                <br /><br />
                <v-icon color="#111" size="75">error_outline</v-icon>
                <br />
                <h2>No Results Found</h2>
                <br />
                <p class="subheading">No Trips were found between the specified stops at this time.</p>
            </div>
        </v-fade-transition>
                
        <!-- Loading Indicator -->
        <div v-if="!results" class="trip-results-loading">
            <v-progress-circular :size="100" color="primary" indeterminate></v-progress-circular>
            <br /><br />
            <h3>Calculating Routes...</h3>
        </div>
                

    </v-container>
</template>


<script>
    const core = require("right-track-core");
    const DateTime = core.utils.DateTime;
    const TripSearch = core.search.TripSearch;
    const cache = require("@/utils/cache.js");
    const DB = require("@/utils/db.js");
    const favorites = require("@/utils/favorites.js");
    const TripResultItem = require("@/components/trip/TripResultItem.vue").default;

    /**
     * List of Stop IDs for Status Information
     * @type {Array}
     */
    let STATUS_STOP_IDS = [];

    /**
     * Status Timer ID
     */
    let STATUS_TIMER_ID = undefined;

    /**
     * Departs In / Highlight Timer ID
     */
    let TIMER_ID = undefined;



    /**
     * Get the Stop for the specified agency and id
     * @param  {string}   agency   Agency ID code
     * @param  {string}   id       Stop Id
     * @param  {Function} callback Callback function(err, stop)
     */
    function _getStop(agency, id, callback) {
        DB.getDB(agency, function(err, db) {
            if ( err ) {
                return callback(err);
            }
            core.query.stops.getStop(db, id, function(err, stop) {
                if ( err ) {
                    return callback(err);
                }
                return callback(null, stop);
            });
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
            }
        ]
        vm.$emit('setToolbarMenuItems', toolbarMenuItems);
    }

    /**
     * Update the More Menu Items
     * @param  {Vue} vm    Vue Instance
     */
    function _updateMoreMenu(vm) {
        let baseItems = [
            {
                type: "item",
                icon: "refresh",
                title: "Refresh Status",
                function: function() {
                    vm.refresh();
                }
            },
            {
                type: "item",
                icon: "loop",
                title: "Reverse Trip",
                function: function() {
                    if ( vm.isNextDeparture ) {
                        vm.$router.push({
                            name: 'trip',
                            params: {
                                agency: vm.$router.currentRoute.params.agency,
                                origin: vm.destination.id,
                                destination: vm.origin.id
                            }
                        });
                    }
                    else {
                        vm.$router.push({
                            name: 'tripDT',
                            params: {
                                agency: vm.$router.currentRoute.params.agency,
                                origin: vm.destination.id,
                                destination: vm.origin.id,
                                date: vm.departure.getDateInt(),
                                time: vm.departure.getTimeInt()
                            }
                        });
                    }
                }
            },
            {
                type: "item",
                icon: "date_range",
                title: "Change Date/Time",
                function: function() {
                    vm.$router.push({
                        name: 'trips',
                        params: {
                            agency: vm.$router.currentRoute.params.agency
                        },
                        query: {
                            origin: vm.origin.id,
                            destination: vm.destination.id,
                            date: vm.departure.getDateInt(),
                            time: vm.departure.getTimeInt()
                        }
                    });
                }
            }
        ]

        // Build Origin and Destination Items
        let originItems = _buildStopMenuItems(vm, vm.origin);
        let destinationItems = _buildStopMenuItems(vm, vm.destination);

        // Build Transfer Items, if provided
        let transferItems = [];
        let count = 0;
        let max = 0;
        if ( vm.statusStopIds && vm.statusStopIds.length > 0 ) {
            
            // Get Transfer Stops
            let transfers = [];
            for ( let i = 0; i < vm.statusStopIds.length; i++ ) {
                if ( vm.statusStopIds[i] !== vm.origin.id ) {
                    transfers.push(vm.statusStopIds[i]);
                }
            }
            
            // Build Transfer Stop Items
            if ( transfers.length > 0 ) {
                count = 0;
                max = transfers.length;
                for ( let i = 0; i < transfers.length; i++ ) {
                    _getStop(vm.$router.currentRoute.params.agency, transfers[i], function(err, stop) {
                        _finishTransfer(stop);
                    });
                }
            }
            else {
                _finish();
            }

        }
        else {
            _finish();
        }


        /**
         * Finish building the Transfer Stop Items
         * @param  {Stop} stop Transfer Stop
         */
        function _finishTransfer(stop) {
            count++;
            let _transferItems = _buildStopMenuItems(vm, stop);
            transferItems = transferItems.concat(_transferItems);
            if ( count >= max ) {
                _finish();
            }
        }

        /**
         * Finish setting up the menu items
         */
        function _finish() {
            let menuItems = _buildMenuItems(baseItems, originItems, transferItems, destinationItems);
            vm.$emit('setMoreMenuItems', menuItems)
        }
    }

    /**
     * Build Menu Items for the specified Stop
     * @param  {Vue} vm    Vue Instance
     * @param  {Stop} stop Stop
     * @return {Array}     Array of Menu Items
     */
    function _buildStopMenuItems(vm, stop) {
        let items = [];
        if ( stop ) {
            items.push({type: "divider", title: stop.name});
            if ( stop.statusId && stop.statusId !== "-1" ) {
                items.push({
                    type: "item",
                    icon: "access_time",
                    title: "View Station Table",
                    function: function() {
                        vm.$router.push({
                            name: 'station',
                            params: {
                                agency: vm.$router.currentRoute.params.agency,
                                stop: stop.id
                            }
                        });
                    }
                });
            }
            items.push({
                type: "item",
                icon: "info",
                title: "Station Information",
                function: function() {
                    window.location = stop.url;
                }
            });
            items.push({
                type: "item",
                icon: "place",
                title: "Station Map",
                function: function() {
                    window.location = "https://www.google.com/maps/search/?api=1&query=" + stop.lat + "," + stop.lon;
                }
            });
        }
        return items;
    }

    /**
     * Combine the specified menu items (assign keys)
     * @param {Array} ... Array(s) of menu items
     * @return {Array}    Combined array of menu items with keys
     */
    function _buildMenuItems() {
        let menuItems = [];
        let index = 1;
        for ( let i = 0; i < arguments.length; i++ ) {
            let items = arguments[i];
            if ( items ) {
                for ( let j = 0; j < items.length; j++ ) {
                    items[j].key = index;
                    index++;
                }
                menuItems = menuItems.concat(items);
            }
        }
        return menuItems;
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

        // Get Origin and Destination
        _getStop(agencyId, originId, function(err, origin) {
            _getStop(agencyId, destinationId, function(err, destination) {
                if ( !origin || !destination ) {
                    vm.results = [];
                    vm.$emit('showSnackbar', {
                        duration: 0,
                        message: 'Unknown Origin or Destination Stop.  Please select another Trip.',
                        dismiss: 'Trips',
                        onDismiss: function() {
                            vm.$router.push({
                                name: "trips",
                                agency: vm.$router.currentRoute.params.agency
                            });
                        }
                    });
                }

                // Set the Stops
                vm.origin = origin;
                vm.destination = destination;

                // Update the Title
                vm.$emit('setTitle', vm.origin.name + " to " + vm.destination.name);

                // Update the Favorite
                _updateFavorites(vm);

                // Update the Menu Items
                _updateToolbarMenu(vm);
                _updateMoreMenu(vm);

                // Update the Results
                _updateResults(vm);
            });
        });
    }

    /**
     * Update the Search Results
     * @param  {Vue} vm    Vue Instance
     */
    function _updateResults(vm) {

        // Set Departure
        vm.isNextDeparture = !vm.$router.currentRoute.params.time || !vm.$router.currentRoute.params.date;
        vm.departure =  vm.isNextDeparture ?  DateTime.now() : DateTime.create(vm.$router.currentRoute.params.time, vm.$router.currentRoute.params.date);
                
        // Create TripSearch
        let search = new TripSearch(vm.origin, vm.destination, vm.departure);

        // Get Database
        DB.getDB(vm.agencyId, function(err, db) {
            if ( err ) {
                console.log(err);
                vm.$emit('showSnackbar', "Database Error. Please try again later.");
                vm.results = [];
                return;
            }

            // Start Search
            search.search(db, function(err, results) {
                vm.results = results;

                // Setup the Status Feeds
                _setupStatusFeeds(vm);

                // Update Status Bar
                _updateStatusBar(vm);

                // Parse the Results
                _parseResults(vm, true, true);
                if ( TIMER_ID ) clearInterval(TIMER_ID);
                if ( vm.isNextDeparture ) TIMER_ID = setInterval(function() { _parseResults(vm) }, 1000);

            });
        });

    }


    /**
     * Set up the Status Feeds for the Origin and Transfer Stops
     * @param  {Vue} vm Vue Instance
     */
    function _setupStatusFeeds(vm) {

        // Set Status Stops
        vm.statusStopIds = [vm.origin.id];
        for ( let i = 0; i < vm.results.length; i++ ) {
            for ( let j = 0; j < vm.results[i].transfers.length; j++ ) {
                let id = vm.results[i].transfers[j].stop.id;
                if ( !vm.statusStopIds.includes(id) ) {
                    vm.statusStopIds.push(id);
                }
            }
        }

        // Update the More Menu Items
        _updateMoreMenu(vm);

        // Get and update Status Info (if departure within 6 hours of now)
        if ( Math.abs(Date.now() - vm.departure.toTimestamp()) < (6*60*60*1000) ) {

            // Update Status Feeds
            _updateStatusFeeds(vm);

            // Clear and set Timer
            if ( STATUS_TIMER_ID ) clearInterval(STATUS_TIMER_ID);
            STATUS_TIMER_ID = setInterval(function(){ _updateStatusFeeds(vm) }, 60000);

        }

    }

    /**
     * Update the Status Feeds for the Origin and Transfer Stops
     * @param  {Vue} vm Vue Instance
     */
    function _updateStatusFeeds(vm) {
        vm.updatingStatus = true;
        let count = 0;
        let max = vm.statusStopIds.length;

        for ( let i = 0; i < vm.statusStopIds.length; i++ ) {
            cache.getStationFeed(vm.agencyId, vm.statusStopIds[i], function(err, feed) {
                if ( !err ) {
                    let exists = false;
                    for ( let j = 0; j < vm.statusFeeds.length; j++ ) {
                        if ( vm.statusFeeds[j].origin.id === feed.origin.id ) {
                            exists = true;
                            vm.$set(vm.statusFeeds, j, feed);
                        }
                    }
                    if ( !exists ) {
                        vm.statusFeeds.push(feed);
                    }
                }
                _finish();
            });
        }

        function _finish() {
            count++;
            if ( count >= max ) {
                vm.updatingStatus = false;
                vm.$nextTick(function() {
                    _parseResults(vm, true);
                });
            }
        }
    }

    /**
     * Update the routes and messages for the Status Bar
     * @param  {Vue} vm Vue Instance
     */
    function _updateStatusBar(vm) {

        // Set messages for Status Bar
        let messages = [
            {
                icon: "train",
                title: vm.origin.name + " to " + vm.destination.name,
            },
            {
                icon: "calendar_today",
                title: vm.isNextDeparture ? "Next Departure" : vm.departure.getTimeReadable() + " on " + vm.departure.getDateReadable()
            }
        ]

        // Set Routes for Status Bar
        let routes = [];
        for ( let i = 0; i < vm.results.length; i++ ) {
            for ( let j = 0; j < vm.results[i].segments.length; j++ ) {
                if ( !routes.includes(vm.results[i].segments[j].trip.route.shortName) ) {
                    routes.push(vm.results[i].segments[j].trip.route.shortName);
                }
            }
        }

        // Update the Status Bar
        vm.$emit('setStatusBar', {visible: true, transitLines: routes, messages: messages});

    }


    /**
     * Parse the Trip Results (after initial search has completed, after 
     * status feeds have updated and periodically every 1 minute)
     * - Set the highlighted trip result index
     * - Set the departs in time of each trip
     * - Match status information to trip result segments
     * @param  {Vue}     vm     Vue Instance
     * @param  {boolean} force  When true, force an update
     * @param  {boolean} scroll When true, will scroll to highlighted trip result
     */
    function _parseResults(vm, force, scroll) {
        if ( force || Date.now() % 60000 <= 1000 ) {

            // Update Next Departure date/time
            let now = DateTime.now();
            if ( vm.isNextDeparture ) vm.departure = now;

            // Parse each Trip Result
            for ( let i = 0; i < vm.results.length; i++ ) {
                let d = DateTime.create(vm.results[i].origin.departure.time, vm.results[i].origin.departure.date);

                // Calculate Departs In Time
                let m = vm.isNextDeparture ? (d.toTimestamp() - now.toTimestamp()) / 1000 / 60 : undefined;
                vm.$set(vm.results[i], "departs", m);
            }

            // Set the Highlight Index
            _setHighlightIndex(vm);

            // Scroll to Highlighted Trip
            if ( scroll ) {
                vm.$nextTick(function() {
                    let el = document.getElementById("trip-result-card-" + vm.resultsHighlightIndex);
                    let pos = el.offsetTop - 100;
                    window.scrollTo(0, pos);
                });
            }


        }

    }


    /**
     * Set the index of the Trip Result to Highlight
     * @param {Vue} vm Vue Instance
     */
    function _setHighlightIndex(vm) {
        let highlight = undefined;
        for ( let i = 0; i < vm.results.length; i++ ) {
            let d = DateTime.create(vm.results[i].origin.departure.time, vm.results[i].origin.departure.date);
            if ( !highlight && d.toTimestamp() >= vm.departure.toTimestamp() ) {
                vm.resultsHighlightIndex = i;
                return;
            }
        }
    }


    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: undefined,
                origin: {},
                destination: {},
                departure: undefined,
                isNextDeparture: false,
                results: undefined,
                resultsHighlightIndex: undefined,
                statusStopIds: [],
                statusFeeds: [],
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

            /**
             * Refresh the real-time status information
             * @return {[type]} [description]
             */
            refresh: function() {
                let vm = this;
                vm.updatingStatus = true;
                setTimeout(function() {
                    _updateStatusFeeds(vm);
                }, 500);
            },

            /**
             * Toggle the Trip as a Favorite
             */
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
            },

            /**
             * Watchers for toolbar menu
             */
            updatingStatus() {
                _updateToolbarMenu(this);
                this.$emit('setProgress', this.updatingStatus);
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
    .trip-result-card {
        margin: 10px 0 40px 0;
    }
    .trip-result-card:active {
        box-shadow: none;
        border: 1px solid #ddd;
    }

    .trip-results-none {
        text-align: center;
    }

    .trip-results-loading {
        width: 100%;
        text-align: center;
        margin: 40px 5px 20px 5px;
        padding: 20px 5px 40px 5px;
    }
</style>