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
                        <p>Check for Updates Automatically: <code>settings.updates.autoCheck = true</code></p>
                        <p>Reset Database: clear and download latest</p>
                        <p>Restore Database: clear and download archive</p>
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
                                            :disabled="this.username === this.user.username">
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
                                                    :disabled="this.email === this.user.email">
                                                        Update
                                                </v-btn>
                                            </div>
                                            <div class="email-button-verify">
                                                <v-btn color="primary" outline block
                                                    @click="verifyEmail"
                                                    :disabled="user.verified">
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
                                            :disabled="!this.password.current || !this.password.new">
                                                Update
                                        </v-btn>
                                    </v-flex>
                                </v-layout>

                                <div class="hidden-sm-and-up"><br /><br /></div>

                                <p><strong>Delete Account:</strong></p>

                                <v-btn color="red" dark block
                                    @click="deleteAccount">
                                        Delete Account
                                </v-btn>

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
    const TAB_NAMES = ["updates", "trips", "account"];
    
    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: undefined,
                activeTab: 0,
                isLoggedIn: true,
                user: {},
                username: undefined,
                email: undefined,
                password: {
                    current: undefined,
                    new: undefined
                }
            }
        },

        // ==== COMPONENT FUNCTIONS ==== //
        methods: {

            /**
             * Update the URL on tab change
             */
            onTabChange() {
                this.$router.replace({
                    name: "settings",
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
                if ( vm.username !== vm.user.username ) {
                    user.updateUsername(vm.username, function(err, user) {
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
                if ( vm.email !== vm.user.email ) {
                    user.updateEmail(vm.email, function(err, user) {
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
                if ( vm.password.current && vm.password.new ) {
                    user.updatePassword(vm.password.current, vm.password.new, function(err, user) {
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
             * Delete the User's account
             * @return {[type]} [description]
             */
            deleteAccount() {
                let vm = this;
                vm.$emit(
                    'showDialog', 
                    'Delete User?', 
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

            // Set Logged In Status
            user.isLoggedIn(function(isLoggedIn, user) {
                vm.isLoggedIn = isLoggedIn;
                if ( isLoggedIn ) {
                    vm.user = user;
                    vm.username = user.username;
                    vm.email = user.email;
                }
            });
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