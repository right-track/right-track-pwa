<template>
    <v-container class="page">
        
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
                        <v-btn color="primary" :disabled="!stationDialogProps.stops" @click="selectOrigin" depressed>
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
                        <v-btn color="primary" :disabled="!stationDialogProps.stops" @click="selectDestination" depressed>
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
                        <v-dialog ref="dateDialog" v-model="dateDialogProps.visible" 
                                  :return-value.sync="dateDialogProps.date"
                                  persistent lazy full-width width="290px">
                            
                            <!-- Date Picker Button -->
                            <template v-slot:activator="{ on }">
                                <v-btn color="primary" @click="dateDialogProps.visible = true" depressed>
                                    <v-icon>calendar_today</v-icon>&nbsp;&nbsp;
                                    <span>{{ departure.date }}</span>
                                    &nbsp;&nbsp;<v-icon>arrow_drop_down</v-icon>
                                </v-btn>
                            </template>
                            
                            <!-- Date Picker -->
                            <v-date-picker v-model="dateDialogProps.date" scrollable>
                                <v-spacer></v-spacer>
                                <v-btn @click="dateDialogProps.visible = false" color="primary" flat>Cancel</v-btn>
                                <v-btn @click="updateDate" color="primary">OK</v-btn>
                            </v-date-picker>

                        </v-dialog>

                    </div>

                    <div class="time-container">
                        
                        <!-- Time Picker Dialog -->
                        <v-dialog ref="timeDialog" v-model="timeDialogProps.visible" 
                                  :return-value.sync="timeDialogProps.time"
                                  persistent lazy full-width width="290px">
                            
                            <!-- Time Picker Button -->
                            <template v-slot:activator="{ on }">
                                <v-btn color="primary" @click="timeDialogProps.visible = true" depressed>
                                    <v-icon>access_time</v-icon>&nbsp;&nbsp;
                                    <span>{{ departure.time }}</span>
                                    &nbsp;&nbsp;<v-icon>arrow_drop_down</v-icon>
                                </v-btn>
                            </template>
                            
                            <!-- Time Picker -->
                            <v-time-picker v-model="timeDialogProps.time" scrollable>
                                <v-spacer></v-spacer>
                                <v-btn @click="timeDialogProps.visible = false" color="primary" flat>Cancel</v-btn>
                                <v-btn @click="updateTime" color="primary">OK</v-btn>
                            </v-time-picker>

                        </v-dialog>

                    </div>

                </div>


            </v-card-text>
        </v-card>

        <div class="trips-button-container">
            <v-btn color="primary" @click="showTripResults" :disabled="!origin || !destination || origin === destination">
                Search
            </v-btn>
        </div>


        <!-- SELECT STATION DIALOG -->
        <rt-stop-selection-dialog :properties="stationDialogProps" @stopSelected="onStopSelected"></rt-stop-selection-dialog>

    </v-container>
</template>


<script>
    const core = require("right-track-core");
    const DateTime = core.utils.DateTime;
    const DB = require("@/utils/db.js");
    const StopSelectionDialog = require("@/components/StopSelectionDialog.vue").default;

    /**
     * Get the Stops from the Agency DB
     * @param  {Vue}      vm       Vue Instance
     * @param  {Function} callback Callback function(stops)
     */
    function _getStops(vm, callback) {
        let agencyID = vm.$route.params.agency;
        DB.getDB(agencyID, function(err, db) {
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


    /**
     * Get the Stop for the specified agency and ID
     * @param  {string}   agency   Agency ID Code
     * @param  {string}   id       Stop ID
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
     * Set the default stop and date/time values
     * - Based on the query params
     * @param {Vue} vm Vue Instance
     */
    function _setParams(vm) {

        // Get Query Params
        let agency = vm.$route.params.agency;
        let origin = vm.$route.query.origin;
        let destination = vm.$route.query.destination;
        let date = vm.$route.query.date;
        let time = vm.$route.query.time;

        // Set Origin
        if ( origin ) {
            _getStop(agency, origin, function(err, stop) {
                if ( !err ) {
                    vm.origin = stop;
                }
            });
        }

        // Set Destination
        if ( destination ) {
            _getStop(agency, destination, function(err, stop) {
                if ( !err ) {
                    vm.destination = stop;
                }
            });
        }

        // Set Default Date and Time
        date = date ? date : DateTime.now().getDateInt();
        time = time ? time : DateTime.now().getTimeGTFS();

        // Set the Date and Time
        _setDateTime(vm, date, time);

    }


    /**
     * Set the Date and Time of the departure and Date/Time Pickers
     * @param {Vue} vm     Vue Instance
     * @param {int} [date] Initial Date (yyyymmdd)
     * @param {int} [time] Initial Time (HHmm)
     */
    function _setDateTime(vm, date, time) {
        vm.departure.datetime = !date || !time ? DateTime.now() : DateTime.create(time, date);
        vm.departure.date = vm.departure.datetime.getDateReadable(true);
        vm.departure.time = vm.departure.datetime.getTimeReadable();

        let d = vm.departure.datetime.date.toString();
        let t = vm.departure.datetime.getTimeGTFS();
        vm.dateDialogProps.date = d.substring(0, 4) + "-" + d.substring(4, 6) + "-" + d.substring(6, 8);
        vm.timeDialogProps.time = t.substring(0, 5);
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
                 * Departure DateTime
                 * @type {Object}
                 */
                departure: {
                    datetime: undefined,
                    date: undefined,
                    time: undefined
                },

                /**
                 * Date Dialog Properties
                 */
                dateDialogProps: {
                    visible: false,
                    date: undefined
                },

                /**
                 * Time Dialog Properties
                 */
                timeDialogProps: {
                    visible: false,
                    time: undefined
                },

                /**
                 * Station Dialog Properties
                 * @type {Object}
                 */
                stationDialogProps: {
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
                this.stationDialogProps.type = "origin";
                this.stationDialogProps.visible = true;
            },

            /**
             * Show the Station Selection Dialog for the Destination
             */
            selectDestination: function() {
                this.stationDialogProps.type = "destination";
                this.stationDialogProps.visible = true;
            },

            /**
             * Handle a selected Date
             * - set the dialog reference
             * - update the formatted string
             */
            updateDate: function() {
                this.$refs.dateDialog.save(this.dateDialogProps.date);
                let p = this.dateDialogProps.date.split("-");
                let date = parseInt(p[0] + "" + p[1] + "" + p[2]);
                _setDateTime(this, date, this.departure.datetime.time);
            },

            /**
             * Handle a selected Time
             * - set the dialog reference
             * - update the formatted string
             */
            updateTime: function() {
                this.$refs.timeDialog.save(this.timeDialogProps.time);
                _setDateTime(this, this.departure.datetime.date, this.timeDialogProps.time);
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
                let agencyId = this.$router.currentRoute.params.agency;
                let originId = this.origin.id;
                let destinationId = this.destination.id;

                let departure = this.departure.datetime;
                let now = new Date();

                // Get trip results for current time
                if ( Math.abs(now.getTime() - departure.toTimestamp()) < 900000 ) {
                    this.$router.push({
                        name: "trip",
                        params: {
                            agency: agencyId,
                            origin: originId,
                            destination: destinationId
                        }
                    });
                }

                // Get trip results for specified departure
                else {
                    this.$router.push({
                        name: "tripDT",
                        params: {
                            agency: agencyId,
                            origin: originId,
                            destination: destinationId,
                            date: departure.getDateInt(),
                            time: departure.getTimeInt()
                        }
                    });
                } 
            }

        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            let vm = this;
            _setParams(vm);
            _getStops(vm, function(stops) {
                vm.stationDialogProps.stops = stops;
            });
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