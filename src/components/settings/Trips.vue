<template>
    <div class="tab-item">

        <h3>Trip Results Display:</h3>

        <!-- Display Mode -->
        <v-layout class="mt-1" row wrap>
            <v-flex xs12 sm8>
                <p>
                    <strong>Display Density:</strong><br />
                    Display the results in a spaced out <strong>comfortable</strong> view or 
                    a more compact <strong>condensed</strong> view
                </p>
            </v-flex>
            <v-flex sm1></v-flex>
            <v-flex xs12 sm3>
                <v-select filled
                    v-model="displayCondensed"
                    :items="displayCondensed_options">
                </v-select>
            </v-flex>
        </v-layout>

        <!-- Departs In Times -->
        <v-layout class="mt-1" row wrap>
            <v-flex xs10>
                <p><strong>Departs In Times</strong><br />Display the 'Departs in x minutes' for upcoming departures</p>
            </v-flex>
            <v-flex xs1></v-flex>
            <v-flex xs1>
                <v-switch class="mt-1" color="primary" v-model="showDepartsInTimes"></v-switch>
            </v-flex>
        </v-layout>

        <!-- Headsigns -->
        <v-layout class="mt-1" row wrap>
            <v-flex xs10>
                <p><strong>Trip Headsigns</strong><br />Display the final destination of trip segments</p>
            </v-flex>
            <v-flex xs1></v-flex>
            <v-flex xs1>
                <v-switch class="mt-1" color="primary" v-model="showHeadsigns"></v-switch>
            </v-flex>
        </v-layout>

        <!-- Travel Times -->
        <v-layout class="mt-1" row wrap>
            <v-flex xs10>
                <p><strong>Travel Times</strong><br />Display the calculated travel times of trips and their segments</p>
            </v-flex>
            <v-flex xs1></v-flex>
            <v-flex xs1>
                <v-switch class="mt-1" color="primary" v-model="showTravelTimes"></v-switch>
            </v-flex>
        </v-layout>

        <br />

        <h3>Trip Searches:</h3>

        <!-- Pre-Departure Hours -->
        <v-layout class="mt-1" row wrap>
            <v-flex xs12 sm8>
                <p>
                    <strong>Pre-Departure Hours:</strong><br />
                    The number of hours <strong>before</strong> the search time to include in the results
                </p>
            </v-flex>
            <v-flex sm1></v-flex>
            <v-flex xs12 sm3>
                <v-select filled
                    v-model="preDepartureHours"
                    :items="preDepartureHours_options">
                </v-select>
            </v-flex>
        </v-layout>

        <!-- Post-Departure Hours -->
        <v-layout class="mt-1" row wrap>
            <v-flex xs12 sm8>
                <p>
                    <strong>Post-Departure Hours:</strong><br />
                    The number of hours <strong>after</strong> the search time to include in the results
                </p>
            </v-flex>
            <v-flex sm1></v-flex>
            <v-flex xs12 sm3>
                <v-select filled
                    v-model="postDepartureHours"
                    :items="postDepartureHours_options">
                </v-select>
            </v-flex>
        </v-layout>

        <br />

        <h3>Transfer Settings:</h3>

        <!-- Allow Transfers -->
        <v-layout class="mt-1" row wrap>
            <v-flex xs10>
                <p><strong>Allow Transfers</strong></p>
            </v-flex>
            <v-flex xs1></v-flex>
            <v-flex xs1>
                <v-switch class="mt-1" color="primary" v-model="allowTransfers"></v-switch>
            </v-flex>
        </v-layout>

        <!-- Max Transfers -->
        <v-layout class="mt-1" row wrap>
            <v-flex xs12 sm8>
                <p>
                    <strong>Max Transfers:</strong><br />
                    The maximum number of transfers allowed on a single trip
                </p>
            </v-flex>
            <v-flex sm1></v-flex>
            <v-flex xs12 sm3>
                <v-select filled
                    v-model="maxTransfers"
                    :items="maxTransfers_options"
                    :disabled="!allowTransfers">
                </v-select>
            </v-flex>
        </v-layout>

        <!-- Change in Directions -->
        <v-layout class="mt-1" row wrap>
            <v-flex xs8>
                <p>
                    <strong>Allow Change in Direction:</strong><br />
                    Allow a transfer between trains that run in opposite directions (this may require an additional fare)
                </p>
            </v-flex>
            <v-flex x3></v-flex>
            <v-flex xs1>
                <v-switch class="mt-1" color="primary" v-model="allowChangeInDirection" :disabled="!allowTransfers"></v-switch>
            </v-flex>
        </v-layout>


        <!-- Min Layover Mins -->
        <v-layout class="mt-1" row wrap>
            <v-flex xs12 sm8>
                <p>
                    <strong>Min Layover Mins:</strong><br />
                    The <strong>minimum</strong> amount of time between arrival and departure of trains at a transfer
                </p>
            </v-flex>
            <v-flex sm1></v-flex>
            <v-flex xs12 sm3>
                <v-select filled
                    v-model="minLayoverMins"
                    :items="minLayoverMins_options"
                    :disabled="!allowTransfers">
                </v-select>
            </v-flex>
        </v-layout>
        

        <!-- Max Layover Mins -->
        <v-layout class="mt-1" row wrap>
            <v-flex xs12 sm8>
                <p>
                    <strong>Max Layover Mins:</strong><br />
                    The <strong>maximum</strong> amount of time between arrival and departure of trains at a transfer
                </p>
            </v-flex>
            <v-flex sm1></v-flex>
            <v-flex xs12 sm3>
                <v-select filled
                    v-model="maxLayoverMins"
                    :items="maxLayoverMins_options"
                    :disabled="!allowTransfers">
                </v-select>
            </v-flex>
        </v-layout>

    </div>
</template>



<script>
    const settings = require('@/utils/settings.js');

    // TRIP SETTINGS OPTIONS
    const DISPLAY_MODES = ["Comfortable", "Condensed"]
    const DEPARTURE_HOURS = [1, 2, 3, 6, 12];
    const MAX_TRANSFERS = [1, 2];
    const LAYOVER_MINS = [0, 1, 5, 10, 15, 30, 60];


    /**
     * Request a refresh of all settings and status information
     * @param  {Vue}      vm         Vue Instance
     * @param  {Function} [callback] Callback function()
     */
    function refresh(vm, callback) {
        vm.$emit('refresh', function() {
            if ( callback ) return callback();
        });
    }


    module.exports = {

        // ==== COMPONENT PROPERTIES ==== //
        props: {
            agencyId: {
                type: [String],
                required: true
            },
            settings: {
                type: Object,
                required: true
            },
            isLoggedIn: {
                type: Boolean,
                required: true
            }
        },

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                displayCondensed: undefined,
                displayCondensed_options: DISPLAY_MODES,
                showDepartsInTimes: undefined,
                showHeadsigns: undefined,
                showTravelTimes: undefined,
                preDepartureHours: undefined,
                preDepartureHours_options: DEPARTURE_HOURS,
                postDepartureHours: undefined,
                postDepartureHours_options: DEPARTURE_HOURS,
                allowTransfers: undefined,
                maxTransfers: undefined,
                allowChangeInDirection: undefined,
                maxTransfers_options: MAX_TRANSFERS,
                minLayoverMins: undefined,
                minLayoverMins_options: LAYOVER_MINS,
                maxLayoverMins: undefined,
                maxLayoverMins_options: LAYOVER_MINS
            }
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            refresh(this);
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {
            settings: {
                deep: true,
                handler(val) {
                    this.displayCondensed = val.trips.condensed ? "Condensed" : "Comfortable";
                    this.showDepartsInTimes = val.trips.showDepartsInTimes;
                    this.showHeadsigns = val.trips.showHeadsigns;
                    this.showTravelTimes = val.trips.showTravelTimes;
                    this.preDepartureHours = val.search.preDepartureHours;
                    this.postDepartureHours = val.search.postDepartureHours;
                    this.allowTransfers = val.search.allowTransfers;
                    this.maxTransfers = val.search.maxTransfers;
                    this.allowChangeInDirection = val.search.allowChangeInDirection;
                    this.minLayoverMins = val.search.minLayoverMins;
                    this.maxLayoverMins = val.search.maxLayoverMins;
                }
            },
            displayCondensed: function(val) {
                settings.setValue("trips.condensed", val === "Condensed")
            },
            showDepartsInTimes: function(val) {
                settings.setValue("trips.showDepartsInTimes", val);
            },
            showHeadsigns: function(val) {
                settings.setValue("trips.showHeadsigns", val);
            },
            showTravelTimes: function(val) {
                settings.setValue("trips.showTravelTimes", val);
            },
            preDepartureHours: function(val) {
                settings.setValue("search.preDepartureHours", val);
            },
            postDepartureHours: function(val) {
                settings.setValue("search.postDepartureHours", val);
            },
            allowTransfers: function(val) {
                settings.setValue("search.allowTransfers", val)
            },
            maxTransfers: function(val) {
                settings.setValue("search.maxTransfers", val);
            },
            allowChangeInDirection: function(val) {
                settings.setValue("search.allowChangeInDirection", val);
            },
            minLayoverMins: function(val) {
                settings.setValue("search.minLayoverMins", val);
            },
            maxLayoverMins: function(val) {
                settings.setValue("search.maxLayoverMins", val);
            }
        }
        
    }
</script>


<style scoped>
    .tab-item {
        padding: 16px;
    }
    .tab-item h3 {
        border-bottom: 1px solid #999;
    }
    .tab-item p {
        margin: 10px 5px;
    }
</style>