<template>
    <div>
        <h1>Stations</h1>
        <p>List of Stations:</p>
        <ul>
            <li v-for="stop in stops" :key="stop.id">{{ stop.name }}</li>
        </ul>
    </div>
</template>

<script>
    const db = require("../../utils/db.js");
    const core = require("right-track-core");


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


    /**
     * Get all Stops for the specified agency
     * @param  {string}   agency   Agency ID Code
     * @param  {Function} callback Callback function(stops)
     */
    _getStops = function(agency, callback) {
        db.getDB(agency, function(err, database) {
            if ( err ) {
                console.log(err);
            }
            else {
                core.query.stops.getStops(database, function(err, stops) {
                    if ( err ) {
                        console.log(err);
                    }
                    else {
                        return callback(stops);
                    }
                });
            }
        });
    }


    module.exports = {

        data: function() {
            return {
                stops: []
            }
        },

        mounted() {
            let agency = this.$route.params.agency;
            let vm = this;

            // Set More Menu Items and Agency Information
            this.$emit('setMoreMenuItems', moreMenuItems);
            this.$emit('setAgencyId', agency);

            // Load the Stops
            _getStops(agency, function(stops) {
                vm.stops = stops;
            });
            
        }

    }

</script>