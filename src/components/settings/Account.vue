<template>
    <div class="tab-item">
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
    </div>
</template>


<script>
    module.exports = {

        // ==== COMPONENT PROPERTIES ==== //
        props: {},

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
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

        // ==== COMPONENT METHODS ==== //
        methods: {

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