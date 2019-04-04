<template>
    <div class="trip-details-wrapper">

        <!-- TRIP DETAILS -->
        <div class="trip-details">

            <div class="trip-details-info" v-if="isDefined()">
                <p><md-icon>train</md-icon> Train #{{ trip.shortName }}</p>
                <p><md-icon>map</md-icon> {{ trip.route.shortName }}</p>
                <p><md-icon>swap_horiz</md-icon> {{ getDirectionDescription() }}</p>
                <p><md-icon>pin_drop</md-icon> From {{ getOriginStopTime().stop.name }}</p>
                <p><md-icon>pin_drop</md-icon> To {{ getDestinationStopTime().stop.name }}</p>
                <p><md-icon>monetization_on</md-icon> <span v-if="!trip.peak">Off </span>Peak</p>
            </div>

            <div class="trip-details-stops" v-if="isDefined()">
                <div v-for="(st, index) in getStopTimes()" :key="st.stop.id" 
                     :style="getStopTimeRowStyle(index)"
                     class="trip-details-stops-row">
                    <div class="trip-details-stop-row-item trip-details-stops-row-time">
                        <span v-if="stopTimeHasDepartureDelay(index)">
                            <md-icon>access_time</md-icon>&nbsp;{{ getStopTimeArrival(index) }}&nbsp;<br />
                        </span>
                        <md-icon>access_time</md-icon>&nbsp;{{ getStopTimeDeparture(index) }}&nbsp;
                    </div>
                    <div class="trip-details-stop-row-item trip-details-stops-row-stop">
                        <div v-if="stopTimeHasDepartureDelay(index)" class="stop-container-both">
                            <div class="stop-icon-arrival">
                                <md-icon>place</md-icon>
                            </div>
                            <div class="stop-name-arrival">
                                {{ st.stop.name }} (Arrive)
                            </div>
                            <div class="stop-icon-departure">
                                <md-icon>place</md-icon>
                            </div>
                            <div class="stop-name-departure">
                                {{ st.stop.name }} (Depart)
                            </div>
                        </div>
                        <div v-else class="stop-container">
                            <div class="stop-icon">
                                <md-icon>place</md-icon>
                            </div>
                            <div class="stop-name">
                                {{ st.stop.name }}
                            </div>
                        </div>
                    </div>
                    <div class="trip-details-stop-row-item trip-details-stops-row-traveltime">
                        {{ getStopTimeTravelTime(index) }}
                    </div>
                    <div class="trip-details-stop-row-item trip-details-stops-row-ada">
                        <md-icon v-if="st.stop.wheelchairBoarding === 1">accessible</md-icon>
                    </div>
                </div>
            </div>

        </div>

        <!-- UNDEFINED TRIP -->
        <div class="trip-details-unknown" v-if="!isDefined()">
            <p><md-icon>help_outline</md-icon> Unknown Trip</p>
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

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Check if the Trip is defined
             * @return {Boolean} True if the trip is defined
             */
            isDefined: function() {
                return this.getStopTimes() && this.getStopTimes().length > 0;
            },

            /**
             * Get the Trip's StopTimes
             * @return {Array} List of StopTimes
             */
            getStopTimes: function() {
                if ( this.trip.stopTimes ) {
                    return this.trip.stopTimes;
                }
                else if ( this.trip.stops ) {
                    return this.trip.stops;
                }
                else { 
                    return undefined;
                }
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
                return undefined;
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
                return undefined;
            },

            /**
             * Get the Trip's Direction Description
             * @return {string} Direction Description
             */
            getDirectionDescription: function() {
                return this.trip.directionDescription ? this.trip.directionDescription : this.trip.direction.description;
            },

            /**
             * Get the style object (background-color, color) of the specified 
             * stop time row
             * @param  {int} index Stop Time Row Index
             * @return {Object}    Stop Time Row Style
             */
            getStopTimeRowStyle: function(index) {
                if ( this.isStopTimeHighlighted(index) ) {
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
             * Determine if the specified stop time row should 
             * be highlighted
             * @param  {int}  index Stop Time Row Index
             * @return {Boolean}    True, if the row should be highlighted
             */
            isStopTimeHighlighted: function(index) {
                if ( this.station ) {
                    return this.getStopTimes()[index].stop.id === this.station.id;
                }
                else if ( this.enter && this.exit ) {
                    let sts = this.getStopTimes();
                    let h = false;
                    for ( let i = 0; i < sts.length; i++ ) {
                        if ( sts[i].stop.id === this.enter.stop.id ) {
                            h = true;
                        }
                        if ( i === index ) {
                            return h;
                        }
                        if ( sts[i].stop.id === this.exit.stop.id ) {
                            h = false;
                        }
                    }
                }
                return false;
            },

            /**
             * Check if the specified stop time has different 
             * arrival and departure times
             * @param  {int} index Stop Time Row Index
             * @return {Boolean}   True, if the Stop Time has a departure delay
             */
            stopTimeHasDepartureDelay: function(index) {
                let st = this.getStopTimes()[index];
                if ( st.arrival.seconds ) {
                    return st.departure.seconds !== st.arrival.seconds
                }
                else if ( st.arrival.time ) {
                    return st.departure.time !== st.arrival.time;
                }
                return false;
            },

            /**
             * Get the arrival time of the specified Stop Time
             * @param  {int} index Stop Time Row Index
             * @return {String}    Formatted arrival time
             */
            getStopTimeArrival: function(index) {
                let st = this.getStopTimes()[index];
                if ( st.arrivalTime ) {
                    return datetime.HHmmssToTime(st.arrivalTime);
                }
                else if ( st.arrival.time ) {
                    return st.arrival.time;
                }
            },

            /**
             * Get the departure time of the specified Stop Time
             * @param  {int} index Stop Time Row Index
             * @return {String}    Formatted departure time
             */
            getStopTimeDeparture: function(index) {
                let st = this.getStopTimes()[index];
                if ( st.departureTime ) {
                    return datetime.HHmmssToTime(st.departureTime);
                }
                else if ( st.departure.time ) {
                    return st.departure.time;
                }
            },

            /**
             * Get the Travel Time to the specified Stop Time
             * @param  {int} index Stop Time index row
             * @return {String}    Formatted travel time
             */
            getStopTimeTravelTime: function(index) {
                let sts = this.getStopTimes();

                // Station
                if ( this.station ) {
                    let start = undefined;
                    let delta = 0;
                    for ( let i = 0; i < sts.length; i++ ) {
                        if ( sts[i].stop.id === this.station.id ) {
                            start = sts[i].departure.seconds ? sts[i].departure.seconds : sts[i].departure.time;
                        }
                        if ( start && i === index ) {
                            let a = sts[i].arrival.seconds ? sts[i].arrival.seconds : sts[i].arrival.time;
                            delta = a - start;
                        }     
                    }
                    if ( delta > 0 ) {
                        return datetime.minutesToString(delta / 60, true);
                    }
                }

                // Trip
                else if ( this.enter && this.exit ) {
                    let start = undefined;
                    let delta = 0;
                    for ( let i = 0; i < sts.length; i++ ) {
                        if ( sts[i].stop.id === this.enter.stop.id ) {
                            start = sts[i].departure.seconds ? sts[i].departure.seconds : sts[i].departure.time;
                        }
                        if ( start && i === index ) {
                            let a = sts[i].arrival.seconds ? sts[i].arrival.seconds : sts[i].arrival.time;
                            delta = a - start;
                        }
                        if ( sts[i].stop.id === this.exit.stop.id ) {
                            start = undefined;
                        }
                    }
                    if ( delta > 0 ) {
                        return datetime.minutesToString(delta / 60, true);
                    }
                }
                
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
    .trip-details .md-icon {
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