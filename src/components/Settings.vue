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
                    <v-tab-item class="tab-item">
                        <h3>Schedule Updates</h3>
                        
                        <v-layout class="mt-1" row wrap>
                            <v-flex xs10>
                                <p><strong>Check for Updates Automatically</strong></p>
                            </v-flex>
                            <v-flex xs1></v-flex>
                            <v-flex xs1>
                                <v-switch class="mt-1" color="primary" v-model="updates_autoCheck"></v-switch>
                            </v-flex>
                        </v-layout>

                        <v-layout class="mt-1" row wrap>
                            <v-flex xs12 sm8>
                                <p><strong>Update Check Frequency</strong></p>
                            </v-flex>
                            <v-flex sm1></v-flex>
                            <v-flex xs12 sm3>
                                <v-select filled
                                    v-model="updates_autoCheckFreq_selected"
                                    :items="updates_autoCheckFreq"
                                    :disabled="!updates_autoCheck"
                                    item-text="label"
                                    item-value="value">
                                </v-select>
                            </v-flex>
                        </v-layout>

                        <br />

                        <v-layout v-if="agencyId" class="mt-1" row wrap>
                            <v-flex xs12 sm8>
                                <p><strong>Last Checked:</strong><br />{{updates_lastChecked}}</p>
                            </v-flex>
                            <v-flex sm1></v-flex>
                            <v-flex class="mt-2" xs12 sm3>
                                <v-btn color="primary" block>Check Now</v-btn>
                            </v-flex>
                        </v-layout>

                        <br />

                        <h3 v-if="agencyId">Reset Database</h3>

                        <v-layout v-if="agencyId" class="mt-1" row wrap>
                            <v-flex xs12 sm8>
                                <p>Clear the currently installed database and <strong>download the latest schedules</strong></p>
                            </v-flex>
                            <v-flex sm1></v-flex>
                            <v-flex class="mt-2" xs12 sm3>
                                <v-btn color="primary" block>Reset</v-btn>
                            </v-flex>
                        </v-layout>

                        <div class="hidden-sm-and-up"><br /><br /></div>

                        <v-layout v-if="agencyId" class="mt-1" row wrap>
                            <v-flex xs12 sm8>
                                <p>Clear the currently installed database and <strong>download a previous set of schedules</strong></p>
                            </v-flex>
                            <v-flex sm1></v-flex>
                            <v-flex class="mt-2" xs12 sm3>
                                <v-btn color="primary" block>Restore</v-btn>
                            </v-flex>
                        </v-layout>

                    </v-tab-item>


                    <!-- TRIP SEARCHES -->
                    <v-tab-item class="tab-item">
                        <h3>Trip Searches:</h3>
                        <p>Allow Transfers: <code>settings.search.allowTransfers = true</code></p>
                        <p>Allow Change in Direction: <code>settings.search.allowChangeInDirection = true</code></p>
                        <p>Pre-Departure Hours: <code>settings.search.preDepartureHours = 3</code></p>
                        <p>Post-Departure Hours: <code>settings.search.postDepartureHours = 6</code></p>
                        <p>Max Layover Mins: <code>settings.search.maxLayoverMins = 30</code></p>
                        <p>Min Layover Mins: <code>settings.search.minLayoverMins = 0</code></p>
                        <p>Max Transfers: <code>settings.search.maxTransfers = 2</code></p>
                    </v-tab-item>


                    <!-- USER ACCOUNT -->
                    <v-tab-item class="tab-item">
                        <h3>User Account</h3>

                        <!-- Not Logged In -->
                        <div v-if="!isLoggedIn">

                            <p>Log In to your <strong>Right Track Account</strong></a> to update your Account settings.</p>

                            <br />

                            <div class="button-container">
                                <div class="button-login">
                                    <v-btn @click="login" color="primary">
                                        <v-icon>person_outline</v-icon> Log In
                                    </v-btn>
                                </div>
                                <div class="button-register">
                                    <v-btn @click="register" color="primary" outline>
                                        <v-icon>person_add</v-icon> Create Account
                                    </v-btn>
                                </div>
                            </div>

                        </div>

                        <!-- Logged In -->
                        <div v-if="isLoggedIn">
                            <v-container class="px-0">

                                <p><strong>Update Username:</strong></p>
                                <v-layout row wrap>
                                    <v-flex xs12 sm8>
                                        <v-text-field box
                                            label="Username" v-model="username"
                                            @keydown.enter.prevent="updateUsername">
                                        </v-text-field>
                                    </v-flex>
                                    <v-flex sm1></v-flex>
                                    <v-flex xs12 sm3>
                                        <v-btn color="primary" block
                                            @click="updateUsername"
                                            :disabled="this.updating || this.username === this.user.username">
                                                Update
                                        </v-btn>
                                    </v-flex>
                                </v-layout>
                                
                                <div class="hidden-sm-and-up"><br /><br /></div>

                                <p><strong>Update Email Address:</strong></p>
                                <v-layout row wrap>
                                    <v-flex xs12 sm8>
                                        <v-text-field box
                                            label="Email Address" v-model="email"
                                            @keydown.enter.prevent="updateEmail">
                                        </v-text-field>
                                    </v-flex>
                                    <v-flex sm1></v-flex>
                                    <v-flex xs12 sm3>
                                        <div class="email-button-container">
                                            <div class="email-button-update">
                                                <v-btn color="primary" block
                                                    @click="updateEmail"
                                                    :disabled="this.updating || this.email === this.user.email">
                                                        Update
                                                </v-btn>
                                            </div>
                                            <div class="email-button-verify">
                                                <v-btn color="primary" outline block
                                                    @click="verifyEmail"
                                                    :disabled="this.updating || user.verified">
                                                        <template v-if="user.verified">
                                                            <v-icon>verified_user</v-icon>&nbsp;Verified
                                                        </template>
                                                        <template v-else>
                                                            Verify
                                                        </template>
                                                </v-btn>
                                            </div>
                                        </div>
                                    </v-flex>
                                </v-layout>

                                <div class="hidden-sm-and-up"><br /><br /></div>

                                <p><strong>Update Password:</strong></p>
                                <v-layout row wrap>
                                    <v-flex xs12 sm8>
                                        <v-text-field type="password" box
                                            label="Current Password" v-model="password.current"
                                            @keydown.enter.prevent="updatePassword">
                                        </v-text-field>
                                    </v-flex>
                                    <v-flex sm1></v-flex>
                                    <v-flex xs12 sm3></v-flex>
                                </v-layout>
                                <v-layout row wrap>
                                    <v-flex xs12 sm8>
                                        <v-text-field type="password" box
                                            label="New Password" v-model="password.new"
                                            @keydown.enter.prevent="updatePassword">
                                        </v-text-field>
                                    </v-flex>
                                    <v-flex sm1></v-flex>
                                    <v-flex xs12 sm3>
                                        <v-btn color="primary" block
                                            @click="updatePassword"
                                            :disabled="this.updating || !this.password.current || !this.password.new">
                                                Update
                                        </v-btn>
                                    </v-flex>
                                </v-layout>

                                <div class="hidden-sm-and-up"><br /><br /></div>

                                
                                <v-layout row wrap>
                                    <v-flex xs12 sm8>
                                        <p class="mt-1">
                                            <strong>Forgot Password:</strong><br />
                                            Get an email with a link to set a new password
                                        </p>
                                    </v-flex>
                                    <v-flex sm1></v-flex>
                                    <v-flex xs12 sm3>
                                        <v-btn color="primary" block
                                            @click="resetPassword">
                                                Reset
                                        </v-btn>
                                    </v-flex>
                                </v-layout>

                                <br />
                                <div class="hidden-sm-and-up"><br /><br /></div>

                                <v-layout row wrap>
                                    <v-flex xs12 sm8>
                                        <p class="mt-1">
                                            <strong>Delete Account:</strong><br />
                                            Remove your account and all saved favorites from the server.
                                        </p>
                                    </v-flex>
                                    <v-flex sm1></v-flex>
                                    <v-flex xs12 sm3>
                                        <v-btn color="red" dark block
                                            @click="deleteAccount">
                                                Delete
                                        </v-btn>
                                    </v-flex>
                                </v-layout>

                            </v-container>
                        </div>

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

    const TAB_NAMES = ["updates", "trips", "account"];

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
     * Refresh data for the Settings tabs
     * @param  {Vue}      vm         Vue Instance
     * @param  {Function} [callback] Callback function()
     */
    function refresh(vm, callback) {
        updateSettings(vm, function() {
            setLoggedIn(vm, function() {
                setDBUpdatedLast(vm, function() {
                    if ( callback ) return callback();
                });
            });
        });
    }


    /**
     * Update the current Settings
     * @param  {Vue}      vm         Vue Instance
     * @param  {Function} [callback] Callback function()
     */
    function updateSettings(vm, callback) {
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


    /**
     * Set the last time the agency DB was checked for an update
     * @param  {Vue}      vm         Vue Instance
     * @param  {Function} [callback] Callback function()
     */
    function setDBUpdatedLast(vm, callback) {
        updates.getDBUpdateLastChecked(vm.agencyId, function(timestamp) {
            if ( timestamp ) {
                vm.updates_lastChecked = new Date(timestamp).toLocaleString();
            }
            else {
                vm.updates_lastChecked = "Unknown";
            }
            if ( callback ) return callback();
        });
    }


    
    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: undefined,
                activeTab: 0,
                isLoggedIn: true,
                settings: {},
                updates_autoCheck: undefined,
                updates_autoCheckFreq: UPDATES_AUTO_CHECK_FREQ,
                updates_autoCheckFreq_selected: undefined,
                updates_lastChecked: undefined,
                user: {},
                username: undefined,
                email: undefined,
                password: {
                    current: undefined,
                    new: undefined
                },
                updating: false
            }
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
             * Update the User's username
             */
            updateUsername() {
                let vm = this;
                if ( !vm.updating && vm.username !== vm.user.username ) {
                    vm.updating = true;
                    user.updateUsername(vm.username, function(err, user) {
                        vm.updating = false;
                        if ( err ) {
                            vm.$emit('showSnackbar', err.message);
                        }
                        else {
                            vm.user = user;
                            vm.$forceUpdate();
                            vm.$emit('showSnackbar', 'Username Updated');
                        }
                    });
                }
            },

            /**
             * Update the User's email address
             */
            updateEmail() {
                let vm = this;
                if ( !vm.updating && vm.email !== vm.user.email ) {
                    vm.updating = true;
                    user.updateEmail(vm.email, function(err, user) {
                        vm.updating = false;
                        if ( err ) {
                            vm.$emit('showSnackbar', err.message);
                        }
                        else {
                            vm.user = user;
                            vm.$forceUpdate();
                            vm.$emit('showSnackbar', 'Email Address Updated');
                        }
                    });
                }
            },

            /**
             * Verify the User's email address
             */
            verifyEmail() {
                this.$router.push({
                    name: "verify",
                    query: {
                        agency: this.agencyId,
                        src: '/' + this.agencyId + '/settings?tab=account'
                    }
                });
            },

            /**
             * Update the User's password
             * @return {[type]} [description]
             */
            updatePassword() {
                let vm = this;
                if ( !vm.updating && vm.password.current && vm.password.new ) {
                    vm.updating = true;
                    user.updatePassword(vm.password.current, vm.password.new, function(err, user) {
                        vm.updating = false;
                        if ( err ) {
                            vm.$emit('showSnackbar', 'Could not update password');
                        }
                        else {
                            vm.user = user;
                            vm.password = {};
                            vm.$forceUpdate();
                            vm.$emit('showSnackbar', 'Password Updated');
                        }
                    });
                }
            },

            /**
             * Redirect to the Password Reset page
             */
            resetPassword() {
                this.$router.push({
                    name: "reset",
                    query: {
                        agency: this.agencyId,
                        src: '/' + this.agencyId + '/settings?tab=account',
                        login: this.username
                    }
                });
            },

            /**
             * Delete the User's account
             * @return {[type]} [description]
             */
            deleteAccount() {
                let vm = this;
                vm.$emit(
                    'showDialog', 
                    'Delete Account?', 
                    'Are you sure you want to delete your account?  Your account information and saved favorites will be removed.  This cannot be undone.',
                    'Delete Account',
                    'Cancel',
                    function() {
                        
                        // Delete the User
                        user.deleteUser(function(err) {
                            if ( err ) {
                                vm.$emit('showSnackbar', err.message);
                            }
                            else {
                                vm.$emit('showSnackbar', 'User Account Deleted');
                                location.reload();
                            }
                        });

                    }
                );
            },

            /**
             * Redirect to the Login page
             */
            login() {
                this.$router.push({
                    name: "login",
                    query: {
                        agency: this.agencyId,
                        src: '/' + this.agencyId + '/settings?tab=account'
                    }
                });
            },

            /**
             * Redirect to the Registration page
             */
            register() {
                this.$router.push({
                    name: "register",
                    query: {
                        agency: this.agencyId,
                        src: '/' + this.agencyId + '/settings?tab=account'
                    }
                });
            },

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
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {
            updates_autoCheck: function(val) {
                settings.setValue("updates.autoCheck", val);
            },
            updates_autoCheckFreq_selected: function(val) {
                settings.setValue("updates.autoCheckFrequency", val);
            }
        }

    }

</script>


<style scoped>
    
    .card-content {
        padding: 0 0 16px 0;
    }

    .tab-item {
        padding: 16px;
    }
    .tab-item h3 {
        border-bottom: 1px solid #999;
    }
    .tab-item p {
        margin: 10px 5px;
    }

    .button-container {
        display: grid;
        grid-gap: 10px;
        grid-template-columns: 1fr;
        grid-template-areas: "login" "register";
    }
    @media (min-width: 600px) {
        .button-container {
            grid-template-columns: 1fr 1fr;
            grid-template-areas: "register login";
        }
    }
    .button-login {
        grid-area: login;
        text-align: center;
    }
    .button-register {
        grid-area: register;
        text-align: center;
    }
    .button-container .v-btn {
        width: 90%;
        max-width: 300px;
    }

    .email-button-container {
        margin-top: 0px;
    }
    @media (min-width: 600px) {
        .email-button-container {
            margin-top: -15px;
        }
    }

</style>