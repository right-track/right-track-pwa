<template>
    <v-container class="container">
        
        <!-- STATION SELECTION CARD -->
        <v-card>
            <v-card-title class="headline secondary-bg">
                <v-icon>access_time</v-icon>&nbsp;&nbsp;Stations
            </v-card-title>
            <v-card-text>
                <p class="subheading">Select a Station below to view upcoming departures and track assignments.</p>

                <div class="card-button-container">
                    <v-btn :disabled="!dialogProps.stops" @click="dialogProps.visible=true" color="primary" depressed>
                        <v-icon>place</v-icon>&nbsp;&nbsp;
                        <span v-if="station">{{ station.name }}</span>
                        <span v-else>Select Station</span>
                        &nbsp;&nbsp;<v-icon>arrow_drop_down</v-icon>
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>

        <div class="stations-button-container">
            <v-btn @click="showStation" :disabled="!station" color="primary">
                Display
            </v-btn>
        </div>


        <!-- SELECT STATION DIALOG -->
        <rt-stop-selection-dialog :properties="dialogProps" @stopSelected="onStopSelected"></rt-stop-selection-dialog>


    </v-container>
</template>


<script>
    const core = require("right-track-core");
    const DB = require("@/utils/db.js");
    const StopSelectionDialog = require("@/components/StopSelectionDialog.vue").default;

    /**
     * Get the Stops from the Agency DB
     * @param  {Vue}      vm       Vue Instance
     * @param  {Function} callback Callback function(stops)
     */
    function _getStops(vm, callback) {
        let agencyID = vm.$route.params.agency;
        let db = DB.getDB(agencyID, function(err, db) {
            if ( err ) {
                console.error(err);
                this.$emit('showSnackbar', 'Could not get stops.  Please try again later.');
                return callback([]);
            }
            core.query.stops.getStops(db, function(err, stops) {
                if ( err ) {
                    console.error(err);
                    this.$emit('showSnackbar', 'Could not get stops.  Please try again later.');
                    return callback([]);
                }
                return callback(stops);
            });
        });
    }

    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {

                // Selected Station
                station: undefined,

                // Station Selection Dialog Properties
                dialogProps: {
                    visible: false,
                    type: "station",
                    stops: undefined
                }

            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-stop-selection-dialog': StopSelectionDialog
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Stop selected in Select Station Dialog
             * @param  {Object} stop Selected Stop
             */
            onStopSelected: function(type, stop) {
                this.station = stop;
            },

            showStation: function() {
                if ( this.station ) {
                    this.$router.push({
                        name: "station",
                        params: {
                            agency: this.$route.params.agency,
                            stop: this.station.id
                        }
                    });
                }
            }

        },

        /// ==== COMPONENT MOUNTED ==== //
        mounted() {
            let vm = this;
            _getStops(vm, function(stops) {
                vm.dialogProps.stops = stops;
            });
        }

    }

</script>


<style scoped>
    .card-button-container {
        width: 100%; 
        text-align: center
    }
    .card-button-container .v-btn {
        width: 50%;
        min-width: 200px;
        max-width: 400px;
    }

    .stations-button-container {
        width: 100%;
        max-width: 500px;
        margin: 25px auto;
        text-align: center;
    }
    .stations-button-container .v-btn {
        padding: 10px 50px;
        width: 75%;
        max-width: 400px;
    }
</style>