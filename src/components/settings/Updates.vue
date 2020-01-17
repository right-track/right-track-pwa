<template>
    <div class="tab-item">
        
        <!-- General Settings -->
        <h3>Schedule Updates</h3>

        <!-- Auto Check for Updates -->
        <v-layout class="mt-1" row wrap>
            <v-flex xs10>
                <p><strong>Check for Updates Automatically</strong></p>
            </v-flex>
            <v-flex xs1></v-flex>
            <v-flex xs1>
                <v-switch class="mt-1" color="primary" v-model="autoCheck"></v-switch>
            </v-flex>
        </v-layout>

        <!-- Auto Check Frequency -->
        <v-layout class="mt-1" row wrap>
            <v-flex xs12 sm8>
                <p><strong>Update Check Frequency</strong></p>
            </v-flex>
            <v-flex sm1></v-flex>
            <v-flex xs12 sm3>
                <v-select filled
                    v-model="autoCheckFrequency"
                    :items="autoCheckFrequency_options"
                    :disabled="!autoCheck"
                    item-text="label"
                    item-value="value">
                </v-select>
            </v-flex>
        </v-layout>

        <br />

        <!-- Agency-Specific Settings -->
        <div v-if="agencyId">

            <!-- Last Checked -->
            <v-layout class="mt-1" row wrap>
                <v-flex xs12 sm8>
                    <p><strong>Last Checked:</strong><br />{{lastChecked}}</p>
                </v-flex>
                <v-flex sm1></v-flex>
                <v-flex class="mt-2" xs12 sm3>
                    <v-btn color="primary" block>Check Now</v-btn>
                </v-flex>
            </v-layout>

            <br />

            <h3>Reset Database</h3>

            <!-- Reset -->
            <v-layout class="mt-1" row wrap>
                <v-flex xs12 sm8>
                    <p>Clear the currently installed database and <strong>download the latest schedules</strong></p>
                </v-flex>
                <v-flex sm1></v-flex>
                <v-flex class="mt-2" xs12 sm3>
                    <v-btn color="primary" block>Reset</v-btn>
                </v-flex>
            </v-layout>

            <div class="hidden-sm-and-up"><br /><br /></div>

            <!-- Restore -->
            <v-layout class="mt-1" row wrap>
                <v-flex xs12 sm8>
                    <p>Clear the currently installed database and <strong>download a previous set of schedules</strong></p>
                </v-flex>
                <v-flex sm1></v-flex>
                <v-flex class="mt-2" xs12 sm3>
                    <v-btn color="primary" block>Restore</v-btn>
                </v-flex>
            </v-layout>

        </div>

    </div>
</template>


<script>
    const settings = require('@/utils/settings.js');
    const updates = require('@/utils/updates.js');

    // Update Frequency Options
    const UPDATES_AUTO_CHECK_FREQ = [
        {
            value: 1,
            label: "Every Hour"
        },
        {
            value: 6,
            label: "Every 6 Hours"
        },
        {
            value: 12,
            label: "Every 12 Hours"
        },
        {
            value: 24,
            label: "Every Day"
        },
        {
            value: 168,
            label: "Every Week"
        }
    ]



    /**
     * Request a refresh of all settings and status information
     * @param  {Vue}      vm         Vue Instance
     * @param  {Function} [callback] Callback function()
     */
    function refresh(vm, callback) {
        vm.$emit('refresh', function() {
            setDBUpdatedLast(vm, function() {
                if ( callback ) return callback();
            });
        });
    }


    /**
     * Set the last time the agency DB was checked for an update
     * @param  {Vue}      vm         Vue Instance
     * @param  {Function} [callback] Callback function()
     */
    function setDBUpdatedLast(vm, callback) {
        updates.getDBUpdateLastChecked(vm.agencyId, function(timestamp) {
            if ( timestamp ) {
                vm.lastChecked = new Date(timestamp).toLocaleString();
            }
            else {
                vm.lastChecked = "Unknown";
            }
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
                autoCheck: undefined,
                autoCheckFrequency_options: UPDATES_AUTO_CHECK_FREQ,
                autoCheckFrequency: undefined,
                lastChecked: undefined
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {
            settings: {
                deep: true,
                handler(val) {
                    this.autoCheck = val.updates.autoCheck;
                    this.autoCheckFrequency: val.updates.autoCheckFrequency;
                }
            },
            autoCheck: function(val) {
                settings.setValue("updates.autoCheck", val);
            },
            autoCheckFreq_selected: function(val) {
                settings.setValue("updates.autoCheckFrequency", val);
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