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
                    <v-btn @click="check" color="primary" block>
                        Check Now
                    </v-btn>
                </v-flex>
            </v-layout>

            <p><strong>Currently Installed:</strong><br /><span v-if="version">Version </span>{{version}}</p>

            <br />

            <h3>Reset Database</h3>

            <!-- Reset -->
            <v-layout class="mt-1" row wrap>
                <v-flex xs12 sm8>
                    <p>Clear the currently installed database and <strong>download the latest schedules</strong></p>
                </v-flex>
                <v-flex sm1></v-flex>
                <v-flex class="mt-2" xs12 sm3>
                    <v-btn @click="reset" color="primary" block>
                        Reset
                    </v-btn>
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
                    <v-btn @click="restore" color="primary" :disabled="restoring" block>
                        Restore
                    </v-btn>
                </v-flex>
            </v-layout>

        </div>

    </div>
</template>


<script>
    const api = require('@/utils/api.js');
    const settings = require('@/utils/settings.js');
    const updates = require('@/utils/updates.js');
    const db = require('@/utils/db.js');

    // Update Frequency Options
    const UPDATES_AUTO_CHECK_FREQ = [
        {
            value: 1,
            label: "Every Hour"
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
                db.getDBVersion(vm.agencyId, function(version) {
                    vm.version = version;
                    if ( callback ) return callback();
                });
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


    /**
     * Start the process to check for a DB Update
     * @param  {Vue} vm Vue Instance
     */
    function checkDatabaseUpdate(vm) {
        vm.$emit('checkUpdate', function() {
            refresh(vm);
        });
    }


    /**
     * Clear all stored DB-related data and force an update
     * @param  {Vue} vm Vue Instance
     */
    function resetDatabase(vm) {
        db.clear(vm.agencyId, function() {
            vm.$emit('startUpdate', true);
        });
    }

    /**
     * Get a list of archived DB to select for install
     * @param  {Vue} vm Vue Instance
     */
    function restoreDatabase(vm) {
        if ( vm.agencyId ) {
            vm.restoring = true;
            
            // Download archive list
            api.get("/updates/database/archive/" + vm.agencyId + "?max=10", function(err, resp) {
                vm.restoring = false;

                // Parse repsonse
                if ( err || !resp || !resp.archive || resp.archive.length === 0 ) {
                    vm.$emit('showSnackbar', 'Could not get list of archived databases.  Please try again later.');
                }
                let archive = resp.archive;

                // Set Style
                let css = "<style>";
                css += "#archive-select{border:1px solid #ccc;border-radius:5px;padding:5px 10px;}";
                css += "</style>";

                // Build HTML
                let html = css;
                html += "<p><strong>Select a Database version to install:</strong></p>";
                html += "<select id='archive-select'>";
                for ( let i = 0; i < archive.length; i++ ) {
                    html += "<option value='" + archive[i] + "'>" + archive[i] + "</option>";
                }
                html += "</select>";

                // Display Dialog
                vm.$emit('showDialog',
                    'Restore Database',
                    html,
                    'Download & Install',
                    'Cancel',
                    function() {
                        var e = document.getElementById("archive-select");
                        var version = e.options[e.selectedIndex].value;
                        vm.$emit('startUpdate', true, version);
                    }
                );

            });
        }
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
                lastChecked: undefined,
                version: undefined,
                restoring: false
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {
            check() {
                checkDatabaseUpdate(this);
            },
            reset() {
                resetDatabase(this);
            },
            restore() {
                restoreDatabase(this);
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
                    this.autoCheck = val.updates.autoCheck;
                    this.autoCheckFrequency = val.updates.autoCheckFrequency;
                }
            },
            autoCheck: function(val) {
                settings.setValue("updates.autoCheck", val);
            },
            autoCheckFrequency: function(val) {
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