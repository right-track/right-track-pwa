<template>
    <div>
        <h1>Station Table</h1>
        <h2 v-show="stop.name">{{ stop.name }}</h2>

        <div v-show="departures">
            <h3>Departures:</h3>
            <ul>
                <li v-for="departure in departures">{{ departure.departure.time }} to {{ departure.destination.name }} is {{ departure.status.status }}</li>
            </ul>
        </div>
    </div>
</template>


<script>
    const core = require("right-track-core");
    const cache = require("@/utils/cache.js");
    const DB = require("@/utils/db.js");


    /**
     * Update the Station Stop
     * - Get Stop ID from route path
     * - Get Stop Info from DB
     * - Update the Feed
     * - Update the More Menu Items
     * @param  {Vue} vm    Vue Instance
     */
    function _updateStop(vm) {
        console.log("Updating Stop: [" + vm.$route.params.agency + "] " + vm.$route.params.stop + "...");

        // Update Agency
        vm.agencyId = vm.$route.params.agency;
        vm.$emit('setAgencyId', vm.agencyId);

        // Get the Databse
        DB.getDB(vm.agencyId, function(err, db) {
            if ( err ) {
                console.log(err);
                return;
            }

            // Update the Stop
            core.query.stops.getStop(db, vm.$route.params.stop, function(err, stop) {
                if ( err ) {
                    console.log(err);
                    return;
                }

                // Update the stop reference
                vm.stop = stop;

                // Update the Title
                vm.$emit('setTitle', vm.stop.name);

                // Update the Feed
                _updateFeed(vm);

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
        console.log("Getting Feed...");
        cache.getStationFeed(vm.agencyId, vm.stop.id, function(err, feed) {
            console.log(feed);
            if ( err ) {
                console.log(err);
            }
            else if ( feed.departures ) {
                vm.departures = feed.departures;
            }
        });
    }


    /**
     * Update the More Menu Items
     * @param  {Vue} vm    Vue Instance
     */
    function _updateMoreMenu(vm) {
        console.log("Updating More Menu...");
        let moreMenuItems = [
            {
                key: 1,
                type: "iconItem",
                icon: "star",
                title: "Favorite",
                function: function() {
                    console.log("Toggle favorite");
                }
            },
            {
                key: 2,
                type: "iconItem",
                icon: "refresh",
                title: "Refresh",
                function: function() {
                    console.log("Refresh feed");
                }
            },
            {
                key: 3,
                type: "item",
                title: "Station Information",
                function: function() {
                    console.log("Station Info");
                }
            },
            {
                key: 4,
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
                departures: undefined
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