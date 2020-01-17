<template>
    <v-container class="container">

        <!-- HELP CARD -->
        <v-card>
            <v-card-title class="headline secondary-bg">
                <v-icon>settings</v-icon>&nbsp;&nbsp;Settings
            </v-card-title>

            <v-card-text class="card-content">

                <v-tabs grow icons-and-text
                    v-model="activeTab"
                    v-on:change="onTabChange"
                    height="40"
                    color="secondary-bg">
                
                    <v-tabs-slider color="primary"></v-tabs-slider>

                    <v-tab>
                        <v-icon>save_alt</v-icon>
                    </v-tab>

                    <v-tab>
                        <v-icon>train</v-icon>
                    </v-tab>

                    <v-tab>
                        <v-icon>person</v-icon>
                    </v-tab>


                    <!-- SCHEDULE UPDATES -->
                    <v-tab-item>
                        <rt-settings-updates 
                            :agencyId="agencyId"
                            :settings="settings"
                            :isLoggedIn="isLoggedIn"
                            @refresh="onRefresh">
                        </rt-settings-updates>
                    </v-tab-item>


                    <!-- TRIP SEARCHES -->
                    <v-tab-item>
                        <p>Trips</p>
                        <!-- <rt-settings-trips
                            :agencyId="agencyId"
                            :settings="settings"
                            :isLoggedIn="isLoggedIn"
                            @refresh="onRefresh">
                        </rt-settings-trips> -->
                    </v-tab-item>


                    <!-- USER ACCOUNT -->
                    <v-tab-item>
                        <p>Account</p>
<!--                         <rt-settings-account
                            :agencyId="agencyId"
                            :settings="settings"
                            :isLoggedIn="isLoggedIn"
                            @refresh="onRefresh">
                        </rt-settings-account> -->
                    </v-tab-item>

                </v-tabs>

            </v-card-text>
        </v-card>
    </v-container>
</template>


<script>
    const user = require("@/utils/user.js");
    const settings = require("@/utils/settings.js");
    const updates = require("@/utils/updates.js");

    const Updates = require("@/components/settings/Updates.vue").default;
    const Trips = require("@/components/settings/Trips.vue").default;
    const Account = require("@/components/settings/Account.vue").default;

    const TAB_NAMES = ["updates", "trips", "account"];




    /**
     * Refresh data for the Settings tabs
     * @param  {Vue}      vm         Vue Instance
     * @param  {Function} [callback] Callback function()
     */
    function refresh(vm, callback) {
        console.log("...REFRESHING");
        updateSettings(vm, function() {
            setLoggedIn(vm, function() {
                console.log("...DONE");
                if ( callback ) return callback();
            });
        });
    }


    /**
     * Update the current Settings
     * @param  {Vue}      vm         Vue Instance
     * @param  {Function} [callback] Callback function()
     */
    function updateSettings(vm, callback) {
        console.log("...Updating Settings");
        settings.get(function(current) {
            vm.settings = current;
            vm.updates_autoCheck = current.updates.autoCheck;
            vm.updates_autoCheckFreq_selected = current.updates.autoCheckFrequency;
            if ( callback ) return callback();
        });
    }


    /**
     * Set the current logged in status
     * @param  {Vue}      vm         Vue Instance
     * @param  {Function} [callback] Callback function()
     */
    function setLoggedIn(vm, callback) {
        console.log("...Setting Logged In Status")
        user.isLoggedIn(function(isLoggedIn, user) {
            vm.isLoggedIn = isLoggedIn;
            if ( isLoggedIn ) {
                vm.user = user;
                vm.username = user.username;
                vm.email = user.email;
            }
            if ( callback ) return callback();
        });
    }


    
    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: "",
                activeTab: 0,
                isLoggedIn: true,
                settings: {}
            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-settings-updates': Updates,
            'rt-settings-trips': Trips,
            'rt-settings-account': Account
        },

        // ==== COMPONENT FUNCTIONS ==== //
        methods: {

            /**
             * Update the URL on tab change
             */
            onTabChange() {
                this.$router.replace({
                    path: this.agencyId ? "/" + this.agencyId + "/settings" : "/settings",
                    query: {
                        tab: TAB_NAMES[this.activeTab]
                    }
                });
            },

            /**
             * Handle a refresh request
             * @param  {Function} [callback] Callback function()
             */
            onRefresh(callback) {
                console.log("REFRESH REQUEST RECEIVED...");
                refresh(this, callback);
            }

        },

        // ==== COMPONTENT MOUNTED ==== //
        mounted() {
            let vm = this;
            vm.agencyId = vm.$route.params.agency;

            // Set Active Tab
            let tab = vm.$route.query.tab;
            for ( let i = 0; i < TAB_NAMES.length; i++ ) {
                if ( TAB_NAMES[i] === tab ) {
                    vm.activeTab = i;
                }
            }

            // Refresh data
            refresh(vm);
        }

    }

</script>


<style scoped>
    .card-content {
        padding: 0 0 16px 0;
    }
</style>