<template>
    <div class="trip-details-wrapper">

        <!-- TRIP DETAILS -->
        <div class="trip-details">

            <!-- TRIP METADATA -->
            <div class="trip-details-info" v-if="isDefined">
                <p><v-icon color="#111">train</v-icon> Train #{{ trip.shortName }}</p>
                <p><v-icon color="#111">map</v-icon> {{ trip.route.shortName }}</p>
                <p><v-icon color="#111">swap_horiz</v-icon> {{ getDirectionDescription() }}</p>
                <p><v-icon color="#111">pin_drop</v-icon> From {{ getOriginStopTime().stop.name }}</p>
                <p><v-icon color="#111">pin_drop</v-icon> To {{ getDestinationStopTime().stop.name }}</p>
                <p><v-icon color="#111">monetization_on</v-icon> <span v-if="!trip.peak">Off </span>Peak</p>
            </div>

            <!-- TRIP STOP TIMES -->
            <div class="trip-details-stops" v-if="isDefined">
                <div v-for="(st, index) in getStopTimes()" :key="st.stop.id" 
                     :style="getStopTimeRowStyle(index)"
                     class="trip-details-stops-row">
                    
                    <!-- Arrival / Departure Time -->
                    <div class="trip-details-stop-row-item trip-details-stops-row-time">
                        <span v-if="stopTimeHasDepartureDelay(index)">
                            <v-icon class="v-xsmall-hide" :color="getStopTimeRowTextColor(index)">access_time</v-icon>&nbsp;{{ getStopTimeArrival(index) }}&nbsp;<br />
                        </span>
                        <v-icon class="v-xsmall-hide" :color="getStopTimeRowTextColor(index)">access_time</v-icon>&nbsp;{{ getStopTimeDeparture(index) }}&nbsp;
                    </div>

                    <!-- Stop Name -->
                    <div class="trip-details-stop-row-item trip-details-stops-row-stop">
                        <div v-if="stopTimeHasDepartureDelay(index)" class="stop-container-both">
                            <div class="stop-icon-arrival">
                                <v-icon class="v-xsmall-hide" :color="getStopTimeRowTextColor(index)">place</v-icon>
                            </div>
                            <div class="stop-name-arrival">
                                {{ st.stop.name }} (Arrive)
                            </div>
                            <div class="stop-icon-departure">
                                <v-icon class="v-xsmall-hide" :color="getStopTimeRowTextColor(index)">place</v-icon>
                            </div>
                            <div class="stop-name-departure">
                                {{ st.stop.name }} (Depart)
                            </div>
                        </div>
                        <div v-else class="stop-container">
                            <div class="stop-icon">
                                <v-icon class="v-xsmall-hide" :color="getStopTimeRowTextColor(index)">place</v-icon>
                            </div>
                            <div class="stop-name">
                                {{ st.stop.name }}
                            </div>
                        </div>
                    </div>

                    <!-- Travel Time to Stop -->
                    <div class="trip-details-stop-row-item trip-details-stops-row-traveltime">
                        {{ stopTimesTravelTime[index] }}
                    </div>

                    <!-- Stop ADA -->
                    <div class="trip-details-stop-row-item trip-details-stops-row-ada">
                        <v-icon :color="getStopTimeRowTextColor(index)" v-if="st.stop.wheelchairBoarding === 1">accessible</v-icon>
                    </div>

                </div>
            </div>

        </div>

        <!-- UNDEFINED TRIP -->
        <div class="trip-details-unknown" v-if="!isDefined">
            <p><v-icon>help_outline</v-icon> Unknown Trip</p>
        </div>

    </div>
</template>


<script>
    const datetime = require("@/utils/datetime.js");

    module.exports = {

        // ==== COMPONENT PROPS ==== //
        props: {

            /**
             * Trip to display information for
             * @type {Object}
             */
            trip: {
                type: Object,
                required: true
            },

            /**
             * Stop of the Station Table
             * @type {Object}
             */
            station: {
                type: Object
            },

            /**
             * Enter Stop of the Trip Segment
             * @type {Object}
             */
            enter: {
                type: Object
            },

            /**
             * Exit Stop of the Trip Segment
             * @type {Object}
             */
            exit: {
                type: Object
            }

        },

        // ==== COMPUTED PROPERTIES ==== //
        computed: {

            /**
             * The Trip Details Type
             * @return {string} 'station' or 'trip'
             */
            type: function() {
                if ( this.station ) {
                    return 'station';
                }
                else if ( this.enter && this.exit ) {
                    return 'trip';
                }
            },

            /**
             * The Trip origination source
             * @return {string} 'core' or 'api'
             */
            source: function() {
                if ( this.trip.stopTimes ) {
                    return 'core';
                }
                else if ( this.trip.stops ) {
                    return 'api';
                }
            },

            /**
             * Flag for if the trip is defined
             * @return {Boolean} True if the trip is defined
             */
            isDefined: function() {
                return this.getStopTimes() && this.getStopTimes().length > 0;
            },

            /**
             * A list of indices of the highlighted stops
             * @return {Array} Array of highlighted stop time indices
             */
            stopTimesHighlighted: function() {
                let rtn = [];
                let sts = this.getStopTimes();

                if ( this.type === 'station') {
                    for ( let i = 0; i < sts.length; i++ ) {
                        if ( sts[i].stop.id === this.station.id ) {
                            rtn.push(i);
                        }
                    }
                }

                else if ( this.type === 'trip' ) {
                    let h = false;
                    for ( let i = 0; i < sts.length; i++ ) {
                        if ( sts[i].stop.id === this.enter.stop.id ) {
                            h = true;
                        }
                        if ( h ) {
                            rtn.push(i);
                        }
                        if ( sts[i].stop.id === this.exit.stop.id ) {
                            h = false;
                        }
                    }
                }
                
                return rtn;
            },

            /**
             * A list of travel times to each of the stops
             * @return {Array} Array of formatted travel times
             */
            stopTimesTravelTime: function() {
                let rtn = [];
                let sts = this.getStopTimes();

                // Station
                if ( this.type === 'station' ) {
                    let start = undefined;
                    let delta = 0;
                    for ( let i = 0; i < sts.length; i++ ) {
                        if ( sts[i].stop.id === this.station.id ) {
                            start = this.source === 'core' ? sts[i].departure.time : sts[i].departure.seconds;
                            rtn[i] = "";
                        }
                        else if ( start ) {
                            let a = this.source === 'core' ? sts[i].arrival.time : sts[i].arrival.seconds;
                            delta = a - start;
                            rtn[i] = datetime.minutesToString(delta / 60, true);
                        }
                        else {
                            rtn[i] = "";
                        }
                    }
                }

                // Trip
                else if ( this.type === 'trip' ) {
                    let start = undefined;
                    for ( let i = 0; i < sts.length; i++ ) {
                        let delta = 0;
                        if ( sts[i].stop.id === this.enter.stop.id ) {
                            start = this.source === 'core' ? sts[i].departure.time : sts[i].departure.seconds;
                        }
                        else if ( start ) {
                            let a = this.source === 'core' ? sts[i].arrival.time : sts[i].arrival.seconds;
                            delta = a - start;
                        }

                        if ( sts[i].stop.id === this.exit.stop.id ) {
                            start = undefined;
                        }

                        if ( delta > 0 ) {
                           rtn[i] = datetime.minutesToString(delta / 60, true);
                        }
                        else {
                            rtn[i] = "";
                        }
                    }
                    
                }

                return rtn;
            }

        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Get the Trip's StopTimes
             * @return {Array} List of StopTimes
             */
            getStopTimes: function() {
                if ( this.source === 'core' ) {
                    return this.trip.stopTimes;
                }
                else if ( this.source === 'api' ) {
                    return this.trip.stops;
                }
                return [];
            },

            /**
             * Get the Trip's Origin StopTime
             * @return {Object} The Trip's first StopTime
             */
            getOriginStopTime: function() {
                let stops = this.getStopTimes();
                if ( stops ) {
                    return stops[0];
                }
            },

            /**
             * Get the Trip's Destination StopTime
             * @return {Object} The Trip's last StopTime
             */
            getDestinationStopTime: function() {
                let stops = this.getStopTimes();
                if ( stops ) {
                    return stops[stops.length-1];
                }
            },

            /**
             * Get the Trip's Direction Description
             * @return {string} Direction Description
             */
            getDirectionDescription: function() {
                return this.source === 'core' ? this.trip.directionDescription : this.trip.direction.description;
            },

            /**
             * Get the style object (background-color, color) of the specified 
             * stop time row
             * @param  {int} index Stop Time Row Index
             * @return {Object}    Stop Time Row Style
             */
            getStopTimeRowStyle: function(index) {
                if ( this.stopTimesHighlighted.includes(index) ) {
                    let o = index % 2 === 0 ? "cc" : "ff";
                    return {
                        "background-color": "#" + this.trip.route.color + o,
                        "color": "#" + this.trip.route.textColor
                    }
                }
                else {
                    return {
                        "background-color": index % 2 === 0 ? "#fff" : "#eee",
                        "color": "#000"
                    }
                }
            },

            /**
             * Get the text color for the specified stop time row
             * @param  {int} index Stop Time Row Index
             * @return {string}    Hex color code
             */
            getStopTimeRowTextColor: function(index) {
                return this.stopTimesHighlighted.includes(index) ? "#" + this.trip.route.textColor : "#111";
            },

            /**
             * Check if the specified stop time has different 
             * arrival and departure times
             * @param  {int} index Stop Time Row Index
             * @return {Boolean}   True, if the Stop Time has a departure delay
             */
            stopTimeHasDepartureDelay: function(index) {
                let st = this.getStopTimes()[index];
                return this.source === 'core' ? st.departure.time !== st.arrival.time : st.departure.seconds !== st.arrival.seconds;
            },

            /**
             * Get the arrival time of the specified Stop Time
             * @param  {int} index Stop Time Row Index
             * @return {String}    Formatted arrival time
             */
            getStopTimeArrival: function(index) {
                let st = this.getStopTimes()[index];
                return this.source === 'core' ? datetime.HHmmssToTime(st.arrivalTime) : st.arrival.time;
            },

            /**
             * Get the departure time of the specified Stop Time
             * @param  {int} index Stop Time Row Index
             * @return {String}    Formatted departure time
             */
            getStopTimeDeparture: function(index) {
                let st = this.getStopTimes()[index];
                return this.source === 'core' ? datetime.HHmmssToTime(st.departureTime) : st.departure.time;
            }

        }

    }
</script>


<style scoped>
    .trip-details-wrapper {
        width: 100%;
        background-color: #f9f9f9;
        padding: 5px 10px;
        box-shadow:
            inset 0 12px 3px -10px #CCC,
            inset 0 -12px 3px -10px #CCC;
    }

    .trip-details {
        width: 100%;
        font-weight: normal;
        display: grid;
        grid-gap: 10px;
        grid-template-areas: "info" "stops";
    }
    @media (min-width: 960px) {
        .trip-details {
            grid-template-columns: 200px 1fr;
            grid-template-areas: "info stops";
        }
    }
    .trip-details .v-icon {
        font-size: 18px !important;
    }
    .trip-details p {
        margin: 1px;
    }

    .trip-details-info {
        grid-area: info;
    }

    .trip-details-stops {
        grid-area: stops;
    }

    .trip-details-stops-row {
        display: grid;
        grid-gap: 0 5px;
        grid-template-columns: max-content 1fr 60px 30px;
        grid-template-areas: "time stop traveltime ada";
        background-color: #fff;
        border-top: 1px solid #d4d4d488;
        padding: 5px;
    }
    .trip-details-stops-row:nth-child(even) {
        background-color: #eee;
    }
    .trip-details-stop-row-item {
        margin-top: auto;
        margin-bottom: auto;
    }
    .trip-details-stop-row-time {
        grid-area: time;
    }
    .trip-details-stop-row-stop {
        grid-area: stop;
    }
    .trip-details-stop-row-traveltime {
        grid-area: traveltime;
    }
    .trip-details-stop-row-ada {
        grid-area: ada;
    }

    .stop-container-both {
        display: grid;
        grid-template-columns: 24px 1fr;
        grid-template-areas: "icon-arrival name-arrival" "icon-departure name-departure";
        align-items: center;
    }
    .stop-icon-arrival {
        grid-area: icon-arrival;
    }
    .stop-name-arrival {
        grid-area: name-arrival;
    }
    .stop-icon-departure {
        grid-area: icon-departure;
    }
    .stop-name-departure {
        grid-area: name-departure;
    }
    .stop-container {
        display: grid;
        grid-template-columns: 24px 1fr;
        grid-template-areas: "icon name";
        align-items: center;
    }
    .stop-icon {
        grid-area: icon;
    }
    .stop-name {
        grid-area: name;
    }
    

    .trip-details-unknown {
        width: 100%;
        text-align: center;
        padding: 10px;
    }
</style>