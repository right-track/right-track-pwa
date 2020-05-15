<template>
    <v-dialog v-model.sync="properties.visible" max-width="700" persistent scrollable>
        <v-card class="card">
            <v-card-title class="headline secondary-bg">                
                <v-icon>train</v-icon>&nbsp;&nbsp;Trip Details
                <v-spacer></v-spacer>
                <v-icon @click="close">close</v-icon>
            </v-card-title>
        
            <rt-trip-details class="card-body" v-if="properties.trip" :trip="properties.trip" :enter="enter" :exit="exit"></rt-trip-details>
        </v-card>
    </v-dialog>
</template>


<script>
    const DateTime = require("right-track-core").utils.DateTime;
    const TripDetails = require("@/components/trip/TripDetails.vue").default;

    module.exports = {

        // ==== COMPONENT PROPERTIES ==== //
        props: {

            /**
             * Dialog Properties
             * - visible: boolean
             * - trainNumber: string
             * - date: int
             * - trip: Trip
             * @type {Object}
             */
            properties: {
                type: Object,
                required: true
            }

        },

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                enter: undefined,
                exit: undefined
            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-trip-details': TripDetails
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Reset and close the dialog
             */
            close() {
                this.properties.visible = false;
            }
            
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {

            /**
             * Watch the dialog properties
             * - Set the enter and exit stops when displaying dialog
             * @type {Object}
             */
            properties: {
                handler(value) {
                    if ( value.visible ) {
                        this.enter = undefined;
                        this.exit = undefined;
                        let now = DateTime.now();
                        let stopTimes = this.properties.trip.stopTimes;
                        if ( now.getDateInt() === this.properties.date ) {
                            let time = now.getTimeSeconds();
                            for ( let i = 0; i < stopTimes.length; i++ ) {
                                if ( !this.enter && stopTimes[i].departure.time >= time ) {
                                    this.enter = stopTimes[i];
                                }
                                if ( stopTimes[i].arrival.time >= time ) {
                                    this.exit = stopTimes[i];
                                }
                            }
                        }
                        else {
                            this.enter = stopTimes[0];
                            this.exit = stopTimes[stopTimes.length-1];
                        }
                    }
                },
                deep: true
            }

        }

    }
</script>


<style scoped>
    .card-body {
        padding: 5px;
        max-height: 600px;
        overflow-y: scroll;
    }
</style>