<template>
    <v-container class="container">
        
        <!-- TRIP SELECTION CARD -->
        <v-card class="trip-card">
            <v-card-title class="headline secondary-bg">
                <v-icon>train</v-icon>&nbsp;&nbsp;Trips
            </v-card-title>
            <v-card-text>
                
                <!-- ORIGIN AND DESTINATION -->
                <h3>Origin &amp; Destination</h3>

                <div class="origin-destination-container">

                    <div class="origin-container">
                        <v-btn color="primary" :disabled="!dialogProps.stops" @click="selectOrigin" depressed>
                            <v-icon>place</v-icon>&nbsp;&nbsp;
                            <span v-if="origin">{{ origin.name }}</span>
                            <span v-else>Origin</span>
                            &nbsp;&nbsp;<v-icon>arrow_drop_down</v-icon>
                        </v-btn>
                    </div>

                    <div class="origin-destination-arrow">
                        <v-icon>arrow_forward</v-icon>
                    </div>

                    <div class="destination-container">
                        <v-btn color="primary" :disabled="!dialogProps.stops" @click="selectDestination" depressed>
                            <v-icon>place</v-icon>&nbsp;&nbsp;
                            <span v-if="destination">{{ destination.name }}</span>
                            <span v-else>Destination</span>
                            &nbsp;&nbsp;<v-icon>arrow_drop_down</v-icon>
                        </v-btn>
                    </div>

                </div>


                <!-- DATE AND TIME -->
                <h3>Date &amp; Time</h3>

                <div class="date-time-container">

                    <div class="date-container">

                        <!-- Date Picker Dialog -->
                        <v-dialog ref="dateDialog" v-model="dateDialogVisible" 
                                  :return-value.sync="departure.date"
                                  persistent lazy full-width width="290px">
                            
                            <!-- Date Picker Button -->
                            <template v-slot:activator="{ on }">
                                <v-btn color="primary" @click="dateDialogVisible = true" depressed>
                                    <v-icon>calendar_today</v-icon>&nbsp;&nbsp;
                                    <span>{{ departure.dateString }}</span>
                                    &nbsp;&nbsp;<v-icon>arrow_drop_down</v-icon>
                                </v-btn>
                            </template>
                            
                            <!-- Date Picker -->
                            <v-date-picker v-model="departure.date" scrollable>
                                <v-spacer></v-spacer>
                                <v-btn @click="dateDialogVisible = false" color="primary" flat>Cancel</v-btn>
                                <v-btn @click="selectDate" color="primary">OK</v-btn>
                            </v-date-picker>

                        </v-dialog>

                    </div>

                    <div class="time-container">
                        
                        <!-- Time Picker Dialog -->
                        <v-dialog ref="timeDialog" v-model="timeDialogVisible" 
                                  :return-value.sync="departure.time"
                                  persistent lazy full-width width="290px">
                            
                            <!-- Time Picker Button -->
                            <template v-slot:activator="{ on }">
                                <v-btn color="primary" @click="timeDialogVisible = true" depressed>
                                    <v-icon>access_time</v-icon>&nbsp;&nbsp;
                                    <span>{{ departure.timeString }}</span>
                                    &nbsp;&nbsp;<v-icon>arrow_drop_down</v-icon>
                                </v-btn>
                            </template>
                            
                            <!-- Time Picker -->
                            <v-time-picker v-model="departure.time" scrollable>
                                <v-spacer></v-spacer>
                                <v-btn @click="timeDialogVisible = false" color="primary" flat>Cancel</v-btn>
                                <v-btn @click="selectTime" color="primary">OK</v-btn>
                            </v-time-picker>

                        </v-dialog>

                    </div>

                </div>


            </v-card-text>
        </v-card>

        <div class="trips-button-container">
            <v-btn color="primary" @click="showTripResults" :disabled="!origin || !destination">
                Search
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

                /**
                 * Trip Origin Stop
                 * @type {Object}
                 */
                origin: undefined,

                /**
                 * Trip Destination Stop
                 * @type {Object}
                 */
                destination: undefined,

                /**
                 * Departure Information
                 * @type {Object}
                 */
                departure: {
                    date: new Date().toISOString().substr(0, 10),
                    dateString: undefined,
                    time: new Date().toLocaleTimeString().substr(0, 5),
                    timeString: undefined
                },

                /**
                 * Date Dialog Visibility
                 */
                dateDialogVisible: false,

                /**
                 * Time Dialog Visiblity
                 */
                timeDialogVisible: false,

                /**
                 * Station Dialog Properties
                 * @type {Object}
                 */
                dialogProps: {
                    visible: false,
                    type: undefined,
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
             * Show the Station Selection Dialog for the Origin
             */
            selectOrigin: function() {
                this.dialogProps.type = "origin";
                this.dialogProps.visible = true;
            },

            /**
             * Show the Station Selection Dialog for the Destination
             */
            selectDestination: function() {
                this.dialogProps.type = "destination";
                this.dialogProps.visible = true;
            },

            /**
             * Handle a selected Date
             * - set the dialog reference
             * - update the formatted string
             */
            selectDate: function() {
                this.$refs.dateDialog.save(this.departure.date);
                this.departure.dateString = this.getDepartureDateString();
            },

            /**
             * Handle a selected Time
             * - set the dialog reference
             * - update the formatted string
             */
            selectTime: function() {
                this.$refs.timeDialog.save(this.departure.time);
                this.departure.timeString = this.getDepartureTimeString();
            },

            /**
             * Get the Departure Date String
             * @return {string} Formatted Departure Date
             */
            getDepartureDateString: function() {
                const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                
                let date = new Date(this.departure.date + " 12:00");
                let dow = weekdays[date.getDay()];
                let mon = months[date.getMonth()];
                let day = date.getDate();

                let rtn = dow + ", " + mon + " " + day + ", " + date.getFullYear();
                return rtn;
            },

            /**
             * Get the Departure Time String
             * @return {string} Formatted Departure Time
             */
            getDepartureTimeString: function() {
                console.log(this.departure.time);
                let hr = parseInt(this.departure.time.split(':')[0]);
                let mi = parseInt(this.departure.time.split(':')[1]);
                console.log(hr);
                console.log(mi);
                let ap = undefined; 
                if ( hr === 0 ) {
                    hr = "12";
                    ap = "AM";
                }
                else if ( hr < 12 ) {
                    ap = "AM";
                }
                else if ( hr === 12 ) {
                    ap = "PM";
                }
                else if ( hr > 12 ) {
                    hr = hr - 12;
                    ap = "PM";
                }
                if ( mi < 10 ) {
                    mi = "0" + mi;
                }
                return hr + ":" + mi + " " + ap;
            },

            /**
             * Handle the selected Stop
             * - Set property
             * - Set button title
             */
            onStopSelected: function(type, stop) {
                if ( type === "origin" ) {
                    this.origin = stop;
                }
                else if ( type === "destination" ) {
                    this.destination = stop;
                }
            },

            /**
             * Display the Trip Results Page
             */
            showTripResults: function() {

            }

        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            let vm = this;
            _getStops(vm, function(stops) {
                vm.dialogProps.stops = stops;
            });
            vm.departure.dateString = vm.getDepartureDateString();
            vm.departure.timeString = vm.getDepartureTimeString();
        }

    }
    
</script>


<style scoped>
    .trip-card h3 {
        padding-top: 5px;
    }

    .trip-card .v-btn {
        width: 95%;
        max-width: 300px;
    }

    .origin-destination-container {
        display: grid;
        grid-gap: 10px;
        grid-template-columns: 1fr;
        grid-template-areas: "origin" "arrow" "destination";
        padding-bottom: 15px;
    }
    @media (min-width: 960px) {
        .origin-destination-container {
            grid-template-columns: 1fr 40px 1fr;
            grid-template-areas: "origin arrow destination";
        }
    }
    .origin-container {
        grid-area: origin;
        text-align: center;
    }
    .destination-container {
        grid-area: destination;
        text-align: center;
    }
    .origin-destination-arrow {
        grid-area: arrow;
        text-align: center;
        margin: auto 5px;
    }
    .origin-destination-arrow .v-icon {
        font-size: 28px !important;
        transform: rotate(90deg);
    }
    @media (min-width: 960px) {
        .origin-destination-arrow .v-icon {
            transform: rotate(0deg);
        }
    }

    .date-time-container {
        display: grid;
        grid-gap: 10px;
        grid-template-columns: 1fr;
        grid-template-areas: "date" "time";
    }
    @media (min-width: 960px) {
        .date-time-container {
            grid-template-columns: 1fr 1fr;
            grid-template-areas: "date time";
        }
    }
    .date-container {
        grid-area: date;
        text-align: center;
    }
    .time-container {
        grid-area: time;
        text-align: center;
    }

    .trips-button-container {
        width: 100%;
        text-align: center;
        padding: 20px;
        margin-top: 20px;
    }
    .trips-button-container .v-btn {
        width: 75%;
        max-width: 300px;
    }

</style>