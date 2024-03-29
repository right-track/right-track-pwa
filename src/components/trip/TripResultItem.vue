<template>
    <div class="trip-wrapper" :class="{'highlight-trip-wrapper': highlight, 'share-trip-wrapper': share_selected}" @click="selectTrip">

        <div class="peak" v-if="peakResult">
            <v-tooltip bottom>
                <template #activator="{ on }">
                    <v-icon class="peak-icon" v-on="on">monetization_on</v-icon>
                </template>
                <span>One or more trains on this trip is a peak train and a higher fare may be required</span>
            </v-tooltip>
        </div>
        
        <!-- Departs in Time -->
        <div :class="condensed ? 'trip-departs-time-condensed' : 'trip-departs-time'" v-if="showDepartsInTimes" v-html="departs"></div>
        
        <!-- TRIP SEGMENTS -->
        <div v-for="(segment, index) in trip.segments" :key="'trip-segment-' + index" class="trip-segment-wrapper">
            
            <!-- Headsign -->
            <div :class="condensed ? 'trip-segment-headsign-condensed' : 'trip-segment-headsign'" v-if="showHeadsigns">
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
                    :trip="segment.trip" :enter="segment.enter" :exit="segment.exit" :position="getPosition(segment)">
                </rt-trip-details>
            </v-expand-transition>

            <!-- TRANSFER INFO -->
            <div v-if="trip.transfers[index]" class="trip-segment-transfer">
                <div class="trip-segment-transfer-icon">
                    <v-icon color="#111">airline_stops</v-icon>
                </div>
                <div class="trip-segment-transfer-info">
                    <strong>&nbsp;Transfer @ {{ trip.transfers[index].stop.name }}</strong>
                    <span v-if="condensed && showTravelTimes"> ({{ formatTravelTime(trip.transfers[index].layoverTime, true) }})</span>
                    <br />
                    <span v-if="!condensed && showTravelTimes"><v-icon color="#111">timelapse</v-icon> {{ formatTravelTime(trip.transfers[index].layoverTime) }}</span>
                </div>
            </div>

        </div>

        <!-- Total Travel Time -->
        <div v-if="showTravelTimes && trip.segments.length > 1" class="trip-total-traveltime">
            <div class="spacing" v-if="!condensed"></div>
            <span v-if="!condensed"><strong>Total Travel Time</strong><br /></span>
            <v-icon color="#111">update</v-icon> {{ formatTravelTime(trip.travelTime) }}
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

    /**
     * Find the matching vehicle position information for the specified trip segment
     * from the available list of status feeds
     * @param  {Vue}    vm      Vue Instance
     * @param  {Object} segment Trip Segment
     * @return {Object}         Status Information
     */
    function _findPositionInfo(vm, segment) {
        if ( !vm.statusFeeds ) return undefined;
        for ( let i = 0; i < vm.statusFeeds.length; i++ ) {
            if ( vm.statusFeeds[i].origin.id === segment.enter.stop.id ) {
                for ( let j = 0; j < vm.statusFeeds[i].departures.length; j++ ) {
                    if ( vm.statusFeeds[i].departures[j].trip.shortName === segment.trip.shortName ) {
                        return vm.statusFeeds[i].departures[j].position;
                    }
                }
            }
        }
    }


    module.exports = {

        // ==== COMPONENT PROPS ==== //
        props: {
            trip: Object,
            index: Number,
            highlight: Boolean,
            statusFeeds: Array,
            condensed: Boolean,
            showHeadsigns: Boolean,
            showTravelTimes: Boolean,
            showDepartsInTimes: Boolean,
            share_started: Boolean,
            share_selected: Boolean
        },

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                tripDetailsVisible: false,
                peakResult: false,
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
                    rtn = "<p style='margin: 0'>Departing Now!</p>";
                }

                // Departing within 2 hours
                else if ( mins > 0 && mins <= 120 ) {
                    rtn = "<p style='margin: 0'>Departs in ";
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
                let positionInfo = _findPositionInfo(this, segment);
                let status = statusInfo ? statusInfo.status : "";

                // Build Status HTML
                let html = "";
                if ( !status || status === "" ) {
                    html = "";
                }
                else if ( ['on time', 'scheduled'].includes(status.toLowerCase()) ) {
                    html = "<span style='background-color: #4caf50; color: #fff; padding: 3px 5px; border-radius: 5px'>" + status + "</span>";
                }
                else if ( ['arriving', 'arrived'].includes(status.toLowerCase()) ) {
                    html = "<span style='background-color: #facc15; color: #292524; padding: 3px 5px; border-radius: 5px'>" + status + "</span>";
                }
                else if ( ['departed'].includes(status.toLowerCase()) ) {
                    html = "<span style='background-color: #a8a29e; color: #44403c; padding: 3px 5px; border-radius: 5px'>" + status + "</span>";
                }
                else {
                    html = "<span style='background-color: #ff5252; color: #fff; padding: 3px 5px; border-radius: 5px'>" + status + "</span>";
                }

                // Add real-time location icon
                if ( positionInfo ) {
                    html += "<div style='display: inline; position: absolute; right: 15px; color: #666'>";
                    html += "<i style='font-size: 16px' class='v-icon departure-status-position-icon material-icons'>emergency_share</i>";
                    html += "</div>";
                }

                return html;
            },

            /**
             * Get the Segment's Departure Status
             * @param  {Object} segment Trip Segment
             * @return {string}         Departure Status
             */
            getTrack(segment) {
                let statusInfo = _findStatusInfo(this, segment);
                let rtn = "";
                if ( statusInfo && statusInfo.track && statusInfo.track.track && statusInfo.track.track !== "" ) {
                    if ( statusInfo.track.changed ) {
                        rtn = "<span style='font-weight: 500; text-decoration: underline'>Track " + statusInfo.track.track + "</span>";
                    }
                    else if ( statusInfo.track.scheduled ) {
                        rtn = "<span style='font-weight: 500; opacity: 0.5'><em>Track " + statusInfo.track.track + "</em></span>";
                    }
                    else {
                        rtn = "<span style='font-weight: 500;'>Track " + statusInfo.track.track + "</span>";
                    }
                }
                return rtn;
            },

            /**
             * Get the Segment's raw JSON Position Info
             * @param {Object} segment Trip Segment
             */
            getPosition(segment) {
                return _findPositionInfo(this, segment);
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
             * Format the display of the Track info
             * @param {Object} track Track Info
             */
            formatTrack(track) {
                return "Track " + track.track;
            },

            /**
             * Handle a selected trip
             * - Toggle the trip details visibility
             * @return {[type]} [description]
             */
            selectTrip: function() {
                if ( this.share_started ) {
                    if ( !this.share_selected ) {
                        this.$emit('addShareSelectedResult', this.index);
                    }
                    else {
                        this.$emit('removeShareSelectedResult', this.index);
                    }
                }
                else {
                    this.tripDetailsVisible = !this.tripDetailsVisible;
                }
            }
            
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            this.departs = this.getDeparts(this.trip.departs);
            this.peakResult = false;
            for ( let i = 0; i < this.trip.segments.length; i++ ) {
                this.status[i] = this.getStatus(this.trip.segments[i]);
                this.track[i] = this.getTrack(this.trip.segments[i]);
                if ( this.trip.segments[i].trip.peak ) {
                    this.peakResult = true;
                }
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

    .share-trip-wrapper {
        background-color: #ff0000;
    }
    .share-trip-wrapper:hover {
        background-color: #dd0000;
    }

    .trip-wrapper .v-icon {
        font-size: 16px;
    }

    div.spacing {
        height: 12px;
    }
    
    .trip-departs-time, .trip-departs-time-condensed {
        text-align: center;
        color: #ff6f00;
        font-size: 16px;
        font-weight: bold;
    }
    .trip-departs-time {
        margin: 5px 0 -5px 0;
    }
    .trip-departs-time-condensed {
        margin: 0 0 -10px 0;
    }

    .trip-segment-wrapper {
        display: grid;
        grid-gap: 2px 10px;
        grid-template-columns: 1fr 125px;
        grid-template-areas: "headsign headsign" "times status" "traveltime track" "details details" "transfer transfer";
        padding: 10px 0 0 0;
    }

    .trip-segment-headsign, .trip-segment-headsign-condensed {
        grid-area: headsign;
        text-align: center;
    }
    .trip-segment-headsign {
        margin: 12px 0;
    }
    .trip-segment-headsign-condensed {
        margin: 5px 0;
    }
    .trip-segment-headsign > span, .trip-segment-headsign-condensed > span {
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


    /** Peak Indicator */
    .peak {
        position: absolute;
        top: 15px;
        right: 15px;
    }
    .peak-icon {
        font-size: 18px !important;
        color: #eee;
    }

</style>