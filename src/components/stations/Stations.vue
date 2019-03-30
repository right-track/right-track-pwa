<template>
    <div class="content-container">
        
        <!-- STATION SELECTION CARD -->
        <md-card>
            <md-card-header class="md-card-header-bg rt-secondary">
                <div class="md-title">
                    <md-icon>access_time</md-icon>
                    Stations
                </div>
            </md-card-header>
            <md-card-content class="favorites-card-content">
                <p>Select a Station below to view upcoming departures and track assignments.</p>

                <div>
                    <md-button class="btn-raised rt-primary" :disabled="!stations" @click="showDialog=true">
                        <md-icon>place</md-icon>&nbsp;&nbsp;
                        <span v-if="station">{{ station.name }}</span>
                        <span v-else>Select Station</span>
                        &nbsp;&nbsp;<md-icon>arrow_drop_down</md-icon>
                    </md-button>
                </div>
            </md-card-content>
        </md-card>

        <div class="stations-button-container">
            <md-button 
                class="btn-raised rt-primary" 
                @click="showStation"
                :disabled="!station">
                    Display
            </md-button>
        </div>


        <!-- SELECT STATION DIALOG -->
        <md-dialog :md-active.sync="showDialog">
            <md-dialog-title>
                <md-icon>place</md-icon>&nbsp;Select Station
            </md-dialog-title>

            <md-content class="dialog-content">
                <ul class="dialog-content-list">
                    <li v-for="stop in stations" 
                        :class="{'disabled': stop.statusId === '-1'}"
                        @click="stopSelected(stop)">
                        <p>{{ stop.name }}</p>
                    </li>
                </ul>
            </md-content>

            <md-dialog-actions>
                <md-button class="md-primary" @click="showDialog=false">Close</md-button>
            </md-dialog-actions>
        </md-dialog>


    </div>
</template>


<script>
    const core = require("right-track-core");
    const DB = require("@/utils/db.js");

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
        })
    }

    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {

                // Selected Station
                station: undefined,

                // List of Stops for Stations
                stations: undefined,

                // Show Select Station Dialog flag
                showDialog: false

            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Stop selected in Select Station Dialog
             * @param  {Object} stop Selected Stop
             */
            stopSelected: function(stop) {
                if ( stop.statusId !== "-1" ) {
                    this.showDialog = false;
                    this.station = stop;
                }
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

            // Set More Menu Items
            this.$emit('setMoreMenuItems', []);

            // Get the Stops
            _getStops(this, function(stops) {
                vm.stations = stops;
            });
        }

    }

</script>


<style scoped>
    .md-card-content p {
        font-size: 18px;
    }
    .md-card-content > div {
        width: 100%; 
        text-align: center
    }

    .stations-button-container {
        width: 100%;
        max-width: 500px;
        margin: 25px auto;
        text-align: center;
    }
    .stations-button-container .md-button {
        padding: 10px 50px;
    }


    .dialog-content {
        overflow: auto;
    }
    .dialog-content-list {
        list-style-type: none;
        padding: 0;
    }
    .dialog-content-list li {
        cursor: pointer;
        padding-left: 25px;
        border-top: 1px solid #dfdfdf;
        height: 52px;
        font-size: 16px;
    }
    .dialog-content-list li.disabled {
        cursor: auto;
        text-decoration: line-through;
        color: #666;
    }
    .dialog-content-list li:hover {
        background-color: #eee !important;
    }
    .dialog-content-list li:nth-child(even) {
        background-color: #f5f5f5;
    }
</style>