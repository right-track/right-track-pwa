<template>
    <div class="trip-wrapper" :class="{'highlight-trip-wrapper': highlight}" @click="selectTrip">
        
        <!-- Departs in Time -->
        <div class="trip-departs-time" v-if="showDepartsInTimes" v-html="departs"></div>
        
        <!-- TRIP SEGMENTS -->
        <div v-for="(segment, index) in trip.segments" :key="'trip-segment-' + index" class="trip-segment-wrapper">
            
            <!-- Headsign -->
            <div class="trip-segment-headsign" v-if="showHeadsigns">
                <div class="spacing" v-if="!condensed"></div>
                <span :style="{'background-color': '#' + segment.trip.route.color, 'color': '#' + segment.trip.route.textColor}">
                    <v-icon :color="'#' + segment.trip.route.textColor">train</v-icon> <strong>{{ segment.trip.headsign }}&nbsp;</strong>
                </span>
            </div>
            
            <!-- Departure / Arrival Times -->
            <div class="trip-segment-times">
                {{ formatTime(segment.enter.departureTime) }} <v-icon color="#111">arrow_forward</v-icon> {{ formatTime(segment.exit.arrivalTime) }}
            </div>

            <!-- Status -->
            <div class="trip-segment-status">
                <v-fade-transition>
                    <div :key="'status-' + status[index]" v-html="status[index]"></div>
                </v-fade-transition>
            </div>

            <!-- Travel Time -->
            <div class="trip-segment-traveltime">
                <span v-if="showTravelTimes">
                    &nbsp;<v-icon color="#111">access_time</v-icon> {{ formatTravelTime(segment.travelTime) }}
                </span>
            </div>

            <!-- Track Assignment -->
            <div class="trip-segment-track">
                <v-fade-transition>
                    <div :key="'track-' + track[index]" v-html="track[index]"></div>
                </v-fade-transition>
            </div>

            <!-- Trip Details Section -->
            <v-expand-transition>
                <rt-trip-details v-if="tripDetailsVisible" class="trip-segment-details" 
                    :trip="segment.trip" :enter="segment.enter" :exit="segment.exit">
                </rt-trip-details>
            </v-expand-transition>

            <!-- TRANSFER INFO -->
            <div v-if="trip.transfers[index]" class="trip-segment-transfer">
                <div class="trip-segment-transfer-icon">
                    <v-icon color="#111">call_split</v-icon>
                </div>
                <div class="trip-segment-transfer-info">
                    <strong>&nbsp;Transfer @ {{ trip.transfers[index].stop.name }}</strong>
                    <span v-if="condensed"> ({{ formatTravelTime(trip.transfers[index].layoverTime, true) }})</span>
                    <br />
                    <span v-if="showTravelTimes && !condensed"><v-icon color="#111">timelapse</v-icon> {{ formatTravelTime(trip.transfers[index].layoverTime) }}</span>
                </div>
            </div>

        </div>

        <!-- Total Travel Time -->
        <div v-if="showTravelTimes && trip.segments.length > 1" class="trip-total-traveltime">
            <div class="spacing" v-if="!condensed"></div>
            <span v-if="!condensed"><strong>Total Travel Time</strong><br /></span>
            <v-icon color="#111">access_time</v-icon> {{ formatTravelTime(trip.travelTime) }}
        </div>

    </div>
</template>


<script>
    const TripDetails = require("@/components/trip/TripDetails.vue").default;
    const datetime = require("@/utils/datetime.js");

    /**
     * Find the matching status information for the specified trip segment 
     * from the available list of status feeds
     * @param  {Vue}    vm      Vue Instance
     * @param  {Object} segment Trip Segment
     * @return {Object}         Status Information
     */
    function _findStatusInfo(vm, segment) {
        if ( !vm.statusFeeds ) return undefined;
        for ( let i = 0; i < vm.statusFeeds.length; i++ ) {
            if ( vm.statusFeeds[i].origin.id === segment.enter.stop.id ) {
                for ( let j = 0; j < vm.statusFeeds[i].departures.length; j++ ) {
                    if ( vm.statusFeeds[i].departures[j].trip.shortName === segment.trip.shortName ) {
                        return vm.statusFeeds[i].departures[j].status;
                    }
                }
            }
        }
    }


    module.exports = {

        // ==== COMPONENT PROPS ==== //
        props: {
            trip: Object,
            highlight: Boolean,
            statusFeeds: Array,
            condensed: Boolean,
            showHeadsigns: Boolean,
            showTravelTimes: Boolean,
            showDepartsInTimes: Boolean
        },

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                tripDetailsVisible: false,
                departs: undefined,
                status: [],
                track: []
            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-trip-details': TripDetails
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Get the departs in time for the trip
             * @param  {int}    departs  Departs time (minutes)
             * @return {string}          Formatted departs in string
             */
            getDeparts(departs) {
                let rtn = undefined;
                let mins = Math.ceil(departs);
                
                // Get delay, if present
                let status = _findStatusInfo(this, this.trip.segments[0]);
                if ( status ) mins = mins + status.delay;

                // Departing Now
                if ( mins >= -1 && mins <= 1 ) {
                    rtn = "<p class='trip-departs-time-text'>Departing Now!</p>";
                }

                // Departing within 2 hours
                else if ( mins > 0 && mins <= 120 ) {
                    rtn = "<p class='trip-departs-time-text'>Departs in ";
                    if ( status && status.delay > 0 ) rtn += " about ";
                    rtn += datetime.minutesToString(mins) + "</p>";
                }

                return(rtn);
            },

            /**
             * Get the Segment's Departure Status
             * @param  {Object} segment Trip Segment
             * @return {string}         Departure Status
             */
            getStatus(segment) {
                let statusInfo = _findStatusInfo(this, segment);
                let status = statusInfo ? statusInfo.status : "";
                if ( !status || status === "" ) {
                    return "";
                }
                else if ( status.toLowerCase() === "on time" || status.toLowerCase() === 'scheduled' ) {
                    return "<span style='background-color: #4caf50; color: #fff; padding: 3px 5px; border-radius: 5px'>" + status + "</span>";
                }
                else {
                    return "<span style='background-color: #ff5252; color: #fff; padding: 3px 5px; border-radius: 5px'>" + status + "</span>";
                }
            },

            /**
             * Get the Segment's Departure Status
             * @param  {Object} segment Trip Segment
             * @return {string}         Departure Status
             */
            getTrack(segment) {
                let statusInfo = _findStatusInfo(this, segment);
                let track = statusInfo ? statusInfo.track : "";
                if ( track && track !== "" ) {
                    return "<span style='font-weight: 500'>Track " + track + "</span>";
                }
                else {
                    return track;
                }
            },

            /**
             * Format the Arrival/Departure times to hh:mm ampm
             * @param  {string} time Arrival/Departure Time (HH:mm:ss)
             * @return {string}      Formatted Time
             */
            formatTime(time) {
                return datetime.HHmmssToTime(time);
            },

            /**
             * Format the travel/layover durations to x hours y minutes
             * @param  {string} mins Duration in minutes
             * @param  {boolean} [short] condense the display time
             * @return {string}      Formatted Duration
             */
            formatTravelTime(mins, short) {
                return datetime.minutesToString(mins, short);
            },

            /**
             * Handle a selected trip
             * - Toggle the trip details visibility
             * @return {[type]} [description]
             */
            selectTrip: function() {
                this.tripDetailsVisible = !this.tripDetailsVisible;
            }
            
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            this.departs = this.getDeparts(this.trip.departs);
            for ( let i = 0; i < this.trip.segments.length; i++ ) {
                this.status[i] = this.getStatus(this.trip.segments[i]);
                this.track[i] = this.getTrack(this.trip.segments[i]);
            }
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {

            "trip.departs": function(departs) {
                this.departs = this.getDeparts(departs);
            },

            statusFeeds: {
                handler: function(feeds) {
                    for ( let i = 0; i < this.trip.segments.length; i++ ) {
                        this.status[i] = this.getStatus(this.trip.segments[i]);
                        this.track[i] = this.getTrack(this.trip.segments[i]);
                    }
                    this.$forceUpdate();
                },
                deep: true
            }

        }

    }

</script>


<style scoped>

    .trip-wrapper {
        padding: 7px 0;
        background: linear-gradient(to bottom, #ffffffaa, #ecececaa);
        cursor: pointer;
    }
    .trip-wrapper:hover {
        background-color: #ecececaa;
    }

    .highlight-trip-wrapper {
        border: 3px solid var(--v-primary-base);
    }

    .trip-wrapper .v-icon {
        font-size: 16px !important;
    }

    div.spacing {
        height: 12px;
    }
    
    .trip-departs-time {
        text-align: center;
        color: #ff6f00;
        font-size: 16px;
        font-weight: bold;
        margin-bottom: -10px;
    }

    .trip-segment-wrapper {
        display: grid;
        grid-gap: 2px 10px;
        grid-template-columns: 1fr 125px;
        grid-template-areas: "headsign headsign" "times status" "traveltime track" "details details" "transfer transfer";
        padding: 10px 0 0 0;
    }

    .trip-segment-headsign {
        grid-area: headsign;
        text-align: center;
        margin-bottom: 5px;
    }
    .trip-segment-headsign > span {
        border-radius: 5px;
        padding: 2px;
    }

    .trip-segment-times {
        grid-area: times;
        font-size: 14px;
        font-weight: bold;
        padding-left: 15px;
    }

    .trip-segment-status {
        grid-area: status;
        text-align: center;
        padding-right: 15px;
    }

    .trip-segment-traveltime {
        grid-area: traveltime;
        padding-left: 10px;
        font-size: 90%;
    }

    .trip-segment-track {
        grid-area: track;
        text-align: center;
        padding-right: 15px;
    }

    .trip-segment-transfer {
        grid-area: transfer;
        margin: 0 auto;
        padding: 2px 0 0 0;
        display: grid;
        grid-gap: 10px;
        grid-template-columns: max-content 1fr;
        grid-template-areas: "transfer-icon transfer-info";
        align-items: center;
        font-size: 90%;
    }
    .trip-segment-transfer-icon {
        grid-area: transfer-icon;
        margin: 0 auto;
    }
    .trip-segment-transfer-icon .v-icon {
        font-size: 24px !important;
        -webkit-transform: rotate(90deg);
        -moz-transform: rotate(90deg);
        -o-transform: rotate(90deg);
        -ms-transform: rotate(90deg);
        transform: rotate(90deg);
    }
    .trip-segment-transfer-info {
        grid-area: transfer-info;
    }

    .trip-segment-details {
        grid-area: details;
        margin-top: 10px;
    }

    .trip-total-traveltime {
        text-align: center;
        font-size: 90%;
    }
</style>