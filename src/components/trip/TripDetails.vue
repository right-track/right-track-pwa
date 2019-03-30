<template>
    <div class="trip-details-wrapper">

        <!-- TRIP DETAILS -->
        <div class="trip-details">

            <div class="trip-details-info" v-if="TRIP.isDefined">
                <p><md-icon>train</md-icon> Train #{{ TRIP.shortName }}</p>
                <p><md-icon>map</md-icon> {{ TRIP.route.shortName }}</p>
                <p><md-icon>swap_horiz</md-icon> {{ TRIP.direction.description }}</p>
                <p><md-icon>pin_drop</md-icon> From {{ TRIP.stops[0].stop.name }}</p>
                <p><md-icon>pin_drop</md-icon> To {{ TRIP.stops[TRIP.stops.length-1].stop.name }}</p>
                <p><md-icon>monetization_on</md-icon> <span v-if="!TRIP.peak">Off </span>Peak</p>
            </div>

            <div class="trip-details-stops" v-if="TRIP.isDefined">
                <div v-for="(stop, index) in TRIP.stops" :key="stop.id" 
                     :style="{'background-color': stop.highlight ? '#' + TRIP.route.color : index % 2 === 0 ? '#fff' : '#eee', 'color': stop.highlight ? '#' + TRIP.route.textColor : '#000'}"
                     class="trip-details-stops-row">
                    <div class="trip-details-stop-row-item trip-details-stops-row-time">
                        <span v-if="stop.departure.seconds !== stop.arrival.seconds">
                            <md-icon>access_time</md-icon>&nbsp;{{ stop.arrival.time }}<br />
                        </span>
                        <md-icon>access_time</md-icon>&nbsp;{{ stop.departure.time }}
                    </div>
                    <div class="trip-details-stop-row-item trip-details-stops-row-stop">
                        <span v-if="stop.departure.seconds !== stop.arrival.seconds">
                            <md-icon>place</md-icon>&nbsp;{{ stop.stop.name }} (Arrive)<br />
                            <md-icon>place</md-icon>&nbsp;{{ stop.stop.name }} (Depart)
                        </span>
                        <span v-else>
                            <md-icon>place</md-icon>&nbsp;{{ stop.stop.name }}
                        </span>
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
        <div class="trip-details-unknown" v-if="!TRIP.isDefined">
            <p><md-icon>help_outline</md-icon> Unknown Trip</p>
        </div>

    </div>
</template>


<script>

    /**
     * Convert the number of minutes into h hours m minutes string
     * @param mins number of minutes
     * @param [short] set hours to h and minutes to m
     * @returns {string}
     */
    function minutesToString(mins, short) {
        let h = Math.floor(mins/60);
        let m = Math.floor(mins%60);
        let s = "";

        // Set Hours
        if ( h === 1 ) {
            s += h + " hour";
        }
        else if ( h > 1 ) {
            s += h + " hours";
        }

        // Set Spacer
        if ( m > 0 && h > 0 ) {
            s += " ";
        }

        // Set Minutes
        if ( h === 0 && m === 0 ) {
            s += "0 minutes";
        }
        else if ( m === 1 ) {
            s += m + " minute";
        }
        else if ( m > 1 ) {
            s += m + " minutes";
        }

        // Shorten
        if ( short ) {
            s = s.replace(" minutes", "m");
            s = s.replace(" minute", "m");
            s = s.replace(" hours", "h");
            s = s.replace(" hour", "h");
        }

        return s;
    }

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
                
                // Set if Trip is defined
                this.trip.isDefined = this.trip.stops && this.trip.stops.length > 0;

                // Add Stop Travel Times
                if ( this.trip.isDefined && this.station ) {
                    let start = undefined;
                    for ( let i = 0; i < this.trip.stops.length; i++ ) {
                        if ( this.trip.stops[i].stop.id === this.station.id ) {
                            this.trip.stops[i].highlight = true;
                            start = this.trip.stops[i].departure.seconds;
                        }
                        else if ( start !== undefined ) {
                            let ts = this.trip.stops[i].arrival.seconds - start;
                            this.trip.stops[i].traveltime = minutesToString(ts / 60, true);
                        }
                    }
                }

                return this.trip;
            }
        }
    }
</script>


<style scoped>
    .trip-details-wrapper {
        width: 100%;
        background-color: #f5f5f5;
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
        grid-template-columns: 120px 1fr 60px 30px;
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

    .trip-details-unknown {
        width: 100%;
        text-align: center;
        padding: 10px;
    }
</style>