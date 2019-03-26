<template>
    <div>
        <h1>Trip Results</h1>
        <h2 v-show="origin.name">{{ origin.name }} to {{ destination.name }}</h2>

        <div v-show="results">
            <h3>Results:</h3>
            <ul>
                <li v-for="result in results">{{ result.origin.departureTime }} --> {{ result.destination.arrivalTime }}</li>
            </ul>
        </div>
    </div>
</template>


<script>
    const core = require("right-track-core");
    const TripSearch = core.search.TripSearch;
    const DB = require("@/utils/db.js");


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

                    // Update the More Menu Items
                    _updateMoreMenu(vm);

                    // Update the Results
                    _updateResults(vm);

                });
            });
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
                title: "Test 1",
                function: function() {
                    console.log("Testing 1");
                }
            }
        ]
        vm.$emit('setMoreMenuItems', moreMenuItems);
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
                console.log(results);
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
                results: undefined
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
                _updateStops(this);
            }

        }

    }
    
</script>