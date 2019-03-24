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
    const DB = require("../../utils/db.js");

    // More Menu Items
    const moreMenuItems = [
        {
            key: 1,
            type: "item",
            title: "Test 1",
            function: function() {
                console.log("Testing 1");
            }
        }
    ]


    module.exports = {

        data: function() {
            return {
                agencyId: undefined,
                db: undefined,
                origin: {},
                destination: {},
                results: undefined
            }
        },


        created() {
            let vm = this;
            let agencyId = vm.$route.params.agency;
            let originId = vm.$route.params.origin;
            let destinationId = vm.$route.params.destination;

            // Set Agency
            vm.agencyId = agencyId;

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

                        console.log("Starting Search...");
                        let search = new TripSearch(origin, destination);
                        search.search(db, function(err, results) {
                            console.log("Results:");
                            console.log(err);
                            console.log(results);
                            vm.results = results;
                        });


                    });
                });

            });

        },

        mounted() {
            console.log(this.agencyId);
            this.$emit('setMoreMenuItems', moreMenuItems);
            this.$emit('setAgencyId', this.agencyId); 
        }

    }
    
</script>