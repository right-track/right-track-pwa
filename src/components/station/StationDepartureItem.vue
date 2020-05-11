<template>
    <div>
        <div style="background-color: rgba(0, 0, 0, 0.5);">
            <div class="departure-wrapper" 
                 @click="selectDeparture"
                 v-bind:style="{'background-color': '#' + departure.trip.route.color, background: 'linear-gradient(to bottom, #' + departure.trip.route.color + 'dd, #' + departure.trip.route.color + 'bb)', color: '#' + departure.trip.route.textColor}">
                
                <!-- Departure Time / Estimated Departure Time -->
                <div class="departure-item departure-time">
                    <span v-if="departure.status.delay > 0" class="departure-item-estimated">
                        <span style="text-decoration: line-through;">
                            {{ departure.departure.time }}
                        </span>
                        <br />{{ departure.status.estimatedDeparture.time }}
                    </span>
                    <span v-else>
                        {{ departure.departure.time }}
                    </span>
                </div>

                <!-- Destination / Remarks (medium+) -->
                <div class="departure-item departure-destination">
                    {{ departure.destination.name }}
                    <span v-if="departure.status.remarks" class="v-small-hide">
                        {{ departure.status.remarks }}
                    </span>
                </div>

                <!-- Status -->
                <div class="departure-item departure-status">
                    {{ departure.status.status }}
                </div>

                <!-- Track -->
                <div class="departure-item departure-track">
                    {{ departure.status.track }}
                </div> 

                <!-- Peak -->
                <div class="departure-item departure-peak">
                    <v-tooltip v-if="departure.trip.peak" bottom>
                        <template #activator="{ on }">
                            <v-icon class="departure-peak-icon" v-on="on" v-bind:style="{color: '#' + departure.trip.route.textColor}">monetization_on</v-icon>
                        </template>
                        <span>This departure is on a peak train and a higher fare may be required</span>
                    </v-tooltip>
                </div>

                <!-- Remarks (xs, sm) -->
                <div class="departure-item departure-remarks">
                    {{ departure.status.remarks }}
                </div>

            </div>
        </div>

        <!-- Trip Details -->
        <v-expand-transition>
            <rt-trip-details v-if="tripDetailsVisible" :trip="departure.trip" :station="station"></rt-trip-details>
        </v-expand-transition>

    </div>
</template>


<script>
    const TripDetails = require("@/components/trip/TripDetails.vue").default;

    module.exports = {

        // ==== COMPONENT PROPS ==== //
        props: {
            departure: {
                type: Object,
                required: true
            },
            station: {
                type: Object,
                required: true
            }
        },

        // ==== COMPONENT DATA ==== //
        data: function () {
            return {
                tripDetailsVisible: false
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Toggle the display of the Trip Details for the selected Departure
             */
            selectDeparture() {
                this.tripDetailsVisible = !this.tripDetailsVisible;
            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-trip-details': TripDetails
        }

    }

</script>


<style scoped>
    .departure-wrapper {
        display: grid;
        grid-gap: 0 10px;
        grid-template-columns: 100px 1fr 75px 25px;
        grid-template-areas: "time destination destination peak" "time status track peak" "remarks remarks remarks remarks";
        min-height: 50px;
        cursor: pointer;
        border-top: 1px solid rgba(0, 0, 0, 0.40);
        opacity: 0.90;
    }
    .departure-wrapper:hover {
        opacity: 0.99;
    }
    @media (min-width: 960px) {
        .departure-wrapper {
            grid-template-columns: 100px 1fr 100px 90px 25px;
            grid-template-areas: "time destination status track peak";
        }
    }

    .departure-item {
        margin: auto 0;
        font-weight: bold;
        font-size: 14px;
    }

    .departure-time {
        grid-area: time;
        text-align: center;
    }
    .departure-destination {
        grid-area: destination;
    }
    .departure-status {
        grid-area: status;
    }
    .departure-track {
        grid-area: track;
        text-align: center;
    }
    .departure-peak {
        grid-area: peak;
        text-align: center;
    }
    .departure-remarks {
        grid-area: remarks;
        text-align: center;
    }
    @media (min-width: 960px) {
        .departure-remarks {
            display: none;
        }
    }

    .departure-peak-icon {
        font-size: 18px;
    }
</style>