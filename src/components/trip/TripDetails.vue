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
                <div v-for="(stop, index) in getStopTimes()" :key="stop.id" 
                     :style="{'background-color': stop.highlight ? stop.highlight : index % 2 === 0 ? '#fff' : '#eee', 'color': stop.highlight ? '#' + TRIP.route.textColor : '#000'}"
                     class="trip-details-stops-row">
                    <div class="trip-details-stop-row-item trip-details-stops-row-time">
                        <span v-if="stop.departure.seconds !== stop.arrival.seconds">
                            <md-icon>access_time</md-icon>&nbsp;{{ stop.arrival.time }}&nbsp;<br />
                        </span>
                        <md-icon>access_time</md-icon>&nbsp;{{ stop.departure.time }}&nbsp;
                    </div>
                    <div class="trip-details-stop-row-item trip-details-stops-row-stop">
                        <div v-if="stop.departure.seconds !== stop.arrival.seconds" class="stop-container-both">
                            <div class="stop-icon-arrival">
                                <md-icon>place</md-icon>
                            </div>
                            <div class="stop-name-arrival">
                                {{ stop.stop.name }} (Arrive)
                            </div>
                            <div class="stop-icon-departure">
                                <md-icon>place</md-icon>
                            </div>
                            <div class="stop-name-departure">
                                {{ stop.stop.name }} (Depart)
                            </div>
                        </div>
                        <div v-else class="stop-container">
                            <div class="stop-icon">
                                <md-icon>place</md-icon>
                            </div>
                            <div class="stop-name">
                                {{ stop.stop.name }}
                            </div>
                        </div>
                    </div>
                    <div class="trip-details-stop-row-item trip-details-stops-row-traveltime">
                        {{ stop.traveltime }}
                    </div>
                    <div class="trip-details-stop-row-item trip-details-stops-row-ada">
                        <md-icon v-if="stop.stop.wheelchairBoarding === 1">accessible</md-icon>
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

        // ==== COMPONENT COMPUTED DATA ==== //
        computed: {

            /**
             * Processed Trip
             * - Add isDefined
             * - Add traveltime for stops
             * - Add highlight for stops
             */
            TRIP: function() {
                
                // Rename stopTimes to stops
                if ( this.trip.hasOwnProperty("stopTimes") ) {
                    this.trip.stops = this.trip.stopTimes;
                    delete this.trip.stopTimes;
                }

                // Station: Add Stop Travel Times
                if ( this.isDefined() && this.station ) {
                    let start = undefined;
                    for ( let i = 0; i < this.trip.stops.length; i++ ) {
                        if ( this.trip.stops[i].stop.id === this.station.id ) {
                            let o = i % 2 === 0 ? "cc" : "ff";
                            this.trip.stops[i].highlight = "#" + this.trip.route.color + o;
                            start = this.trip.stops[i].departure.seconds;
                        }
                        else if ( start !== undefined ) {
                            let ts = this.trip.stops[i].arrival.seconds - start;
                            this.trip.stops[i].traveltime = datetime.minutesToString(ts / 60, true);
                        }
                    }
                }

                // Trip: Add Stop Travel Times
                if ( this.isDefined() && this.enter && this.exit ) {
                    let start = undefined;
                    for ( let i = 0; i < this.trip.stops.length; i++ ) {
                        console.log(this.trip.stops[i].stop.id + " =?= " + this.enter.stop.id);
                        if ( this.trip.stops[i].stop.id === this.enter.stop.id ) {
                            let o = i % 2 === 0 ? "cc" : "ff";
                            this.trip.stops[i].highlight = "#" + this.trip.route.color + o;
                            start = this.trip.stops[i].departure.time;
                        }
                        else if ( start !== undefined ) {
                            let o = i % 2 === 0 ? "cc" : "ff";
                            this.trip.stops[i].highlight = "#" + this.trip.route.color + o;
                            let ts = this.trip.stops[i].arrival.time - start;
                            this.trip.stops[i].traveltime = datetime.minutesToString(ts / 60, true);
                            if ( this.trip.stops[i].stop.id === this.exit.stop.id ) {
                                start = undefined;
                            }
                        }
                    }
                }

                return this.trip;
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