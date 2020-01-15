<template>
    <v-container class="container">
        
        <!-- REQUEST RESET CARD -->
        <div v-if="display === 'request'">
            <v-card>
                <v-card-title class="secondary-bg">
                    <v-icon large left>lock_open</v-icon> 
                    <h2>Reset Password</h2>
                </v-card-title>
                <v-card-text>
                    <p class="subheading">
                        If you've forgotten the password to your existing <strong>Right Track Account</strong>, 
                        you can request a password reset link which will allow you to choose a new password.  
                        This link will be sent to the email address registered with your account.
                    </p>

                    <br />

                    <v-form v-model="valid_user" ref="form_user">

                        <!-- User login -->
                        <v-text-field box
                            prepend-icon="person"
                            label="Username or Email"
                            type="email"
                            v-model="user"
                            :rules="[rules.required]"
                            @keydown.enter.prevent="request">
                        </v-text-field>

                        <br /><br />

                        <!-- Buttons -->
                        <div class="button-request-container">
                            <div class="button-request">
                                <v-btn @click="request" :disabled="!valid_user || requesting" color="primary">
                                    <v-icon>lock_open</v-icon>&nbsp;&nbsp;Reset Password
                                </v-btn>
                            </div>
                            <div class="button-request-login">
                                <v-btn @click="cancel" :disabled.sync="requesting" color="primary" outline>
                                    <v-icon>cancel</v-icon>&nbsp;&nbsp;Cancel
                                </v-btn>
                            </div>
                        </div>

                    </v-form>
                </v-card-text>
            </v-card>
        </div>

        <!-- REQUEST SENT -->
        <div v-if="display === 'sent'">
            <v-card>
                <v-card-title class="secondary-bg">
                    <v-icon large left>lock_open</v-icon> 
                    <h2>Link Sent</h2>
                </v-card-title>
                <v-card-text>
                    <p class="subheading">
                        A link to change your password has been sent to the email address registered to the account.
                        Look for an email from <strong>{{request_resp.confirmation.from}}</strong> with a subject of
                        <strong>{{request_resp.confirmation.subject}}</strong>.  You may need to check your mail's 
                        Junk/Spam folder.  The link will expire on {{request_resp.token.expires}}.
                    </p>
                </v-card-text>
            </v-card>
        </div>

        <!-- RESET PASSWORD CARD -->
        <div v-if="display === 'update'">
            <v-card>
                <v-card-title class="secondary-bg">
                    <v-icon large left>lock_open</v-icon> 
                    <h2>Reset Password</h2>
                </v-card-title>
                <v-card-text>
                    <p class="subheading">
                        Enter your new password in the form below.  Once your password is reset, you will need 
                        to login to any existing browser sessions.
                    </p>

                    <br />

                    <v-form v-model="valid_pass" ref="form_pass">

                        <!-- User Password -->
                        <v-text-field box
                            prepend-icon="lock"
                            label="Password"
                            type="password"
                            v-model="pass"
                            :rules="[rules.required]"
                            @keydown.enter.prevent="update">
                        </v-text-field>

                        <br /><br />

                        <!-- Buttons -->
                        <div class="button-update-container">
                            <div class="button-update">
                                <v-btn @click="update" :disabled="!valid_pass || updating" color="primary">
                                    <v-icon>lock_open</v-icon>&nbsp;&nbsp;Reset Password
                                </v-btn>
                            </div>
                            <div class="button-update-login">
                                <v-btn @click="cancel" :disabled.sync="updating" color="primary" outline>
                                    <v-icon>cancel</v-icon>&nbsp;&nbsp;Cancel
                                </v-btn>
                            </div>
                        </div>

                    </v-form>
                </v-card-text>
            </v-card>
        </div>

        <!-- PASSWORD RESET SUCCESS CARD -->
        <div v-if="display === 'success'">
            <v-card>
                <v-card-title class="secondary-bg">
                    <v-icon large left>lock_open</v-icon> 
                    <h2>Reset Password</h2>
                </v-card-title>
                <v-card-text style="text-align: center">

                    <br />

                    <v-icon large>lock</v-icon>

                    <br /><br />

                    <p class="subheading">
                        <strong>Password Reset!</strong>
                        <br /><br />
                        You must log in again with your new password.
                    </p>

                    <br />

                    <v-btn @click="login" :disabled.sync="updating" color="primary" block>
                        <v-icon>person_outline</v-icon>&nbsp;&nbsp;Log In
                    </v-btn>

                </v-card-text>
            </v-card>
        </div>

    </v-container>
</template>


<script>
    const user = require("@/utils/user.js");

    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                display: "request",
                agencyId: undefined,
                src: undefined,
                user: undefined,
                token: undefined,
                userId: undefined,
                pass: undefined,
                valid_user: undefined,
                valid_pass: undefined,
                requesting: false,
                updating: false,
                rules: {
                    required: function(value) {
                       return !!value || 'Required';
                    }
                },
                request_resp: undefined
            }
        },

        // ==== COMPONENT FUNCTIONS ==== //
        methods: {

            /**
             * Redirect to the Login page
             */
            login() {
                this.$router.push({
                    name: "login",
                    query: {
                        agency: this.agencyId,
                        src: this.src
                    }
                });
            },

            /**
             * Redirect to the source page
             */
            cancel() {
                this.$router.push({
                    path: this.src ? this.src : (this.agencyId ? '/' + this.agencyId : '/')
                });
            },

            /**
             * Start the request password reset process
             */
            request() {
                if ( this.$refs.form_user.validate() ) {
                    let vm = this;
                    vm.requesting = true;
                    
                    // Request Password Reset
                    user.requestPasswordReset(vm.user, vm.agencyId, vm.src, function(err, resp) {
                        vm.requesting = false;
                        if ( err ) {
                            vm.$emit('showSnackbar', err.message);
                        }
                        else {
                            vm.request_resp = resp;
                            vm.display = "sent";
                        }
                    });
                }
            },

            /**
             * Start the update process
             */
            update() {
                if ( this.$refs.form_pass.validate() ) {
                    let vm = this;
                    vm.updating = true;

                    // Update Password
                    user.resetPassword(vm.userId, vm.token, vm.pass, function(err) {
                        vm.updating = false;
                        if ( err ) {
                            vm.$emit('showSnackbar', err.message);
                        }
                        else {
                            vm.display = "success";
                        }
                    });
                }
            }

        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            this.agencyId = this.$route.query.agency;
            this.src = this.$route.query.src;
            this.user = this.$route.query.login;
            this.token = this.$route.query.token;
            this.userId = this.$route.query.user;
            if ( this.token && this.userId ) {
                this.display = "update";
            }
        }

    }
</script>


<style scoped>
    .button-request-container {
        display: grid;
        grid-gap: 10px;
        grid-template-columns: 1fr;
        grid-template-areas: "request" "request-login";
    }
    @media (min-width: 600px) {
        .button-request-container {
            grid-template-columns: 1fr 1fr;
            grid-template-areas: "request-login request";
        }
    }
    .button-request {
        grid-area: request;
        text-align: center;
    }
    .button-request-login {
        grid-area: request-login;
        text-align: center;
    }
    .button-request-container .v-btn {
        width: 90%;
        max-width: 300px;
    }

    .button-update-container {
        display: grid;
        grid-gap: 10px;
        grid-template-columns: 1fr;
        grid-template-areas: "update" "update-login";
    }
    @media (min-width: 600px) {
        .button-update-container {
            grid-template-columns: 1fr 1fr;
            grid-template-areas: "update-login update";
        }
    }
    .button-update {
        grid-area: update;
        text-align: center;
    }
    .button-update-login {
        grid-area: update-login;
        text-align: center;
    }
    .button-update-container .v-btn {
        width: 90%;
        max-width: 300px;
    }
</style>