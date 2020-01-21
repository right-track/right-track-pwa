<template>
    <div class="tab-item">
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


        <p>Post-Departure Hours: <code>settings.search.postDepartureHours = 6</code></p>


        <h3>Transfer Settings:</h3>

        <p>Allow Transfers: <code>settings.search.allowTransfers = true</code></p>
        <p>Max Transfers: <code>settings.search.maxTransfers = 2</code></p>
        <p>Allow Change in Direction: <code>settings.search.allowChangeInDirection = true</code></p>
        <p>Max Layover Mins: <code>settings.search.maxLayoverMins = 30</code></p>
        <p>Min Layover Mins: <code>settings.search.minLayoverMins = 0</code></p>
        

    </div>
</template>



<script>

    const DEPARTURE_HOURS = [1, 2, 3, 6, 12];


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
                preDepartureHours: undefined,
                preDepartureHours_options: DEPARTURE_HOURS,
                postDepartureHours: undefined,
                postDepartureHours_options: DEPARTURE_HOURS
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

        },

        // ==== COMPONENT MOUNTED 
        
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