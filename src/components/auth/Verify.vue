<template>
    <v-container class="container container-padded">

        <!-- USER NOT LOGGED IN -->
        <div v-if="display === 'login'">
            <p>You must be logged in before verifying an email address.</p>
        </div>
        
        <!-- REQUEST VERIFICATION CARD -->
        <div v-if="display === 'request'">
            <v-card>
                <v-card-title class="secondary-bg">
                    <v-icon large left>verified_user</v-icon> 
                    <h2>Verify Email</h2>
                </v-card-title>
                <v-card-text>
                    <p class="subheading">
                        This will verify the email address associated with your account by sending a verification link 
                        to your registered email address.  After following the link your email address will be verified.
                    </p>

                    <br />

                    <v-form ref="form">

                        <!-- Email Address -->
                        <v-text-field disabled box
                            prepend-icon="person"
                            label="Email Address"
                            type="email"
                            v-model="email"
                            @keydown.enter.prevent="request">
                        </v-text-field>

                        <br /><br />

                        <!-- Buttons -->
                        <div class="button-request-container">
                            <div class="button-request">
                                <v-btn @click="request" :disabled="requesting" color="primary">
                                    <v-icon>verified_user</v-icon>&nbsp;&nbsp;Verify Email
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
                    <v-icon large left>verified_user</v-icon> 
                    <h2>Link Sent</h2>
                </v-card-title>
                <v-card-text>
                    <p class="subheading">
                        A link to verify your email has been sent to the email address registered to the account.
                        Look for an email from <strong>{{request_resp.confirmation.from}}</strong> with a subject of
                        <strong>{{request_resp.confirmation.subject}}</strong>.  You may need to check your mail's 
                        Junk/Spam folder.  The link will expire on {{request_resp.token.expires}}.
                    </p>
                </v-card-text>
            </v-card>
        </div>

        <!-- VERIFY EMAIL CARD -->
        <div v-if="display === 'verify'">
            <v-card>
                <v-card-title class="secondary-bg">
                    <v-icon large left>verified_user</v-icon> 
                    <h2>Verify Email</h2>
                </v-card-title>
                <v-card-text style="text-align: center">

                    <br />

                    <v-progress-circular color="primary" :size="50" indeterminate></v-progress-circular>

                    <br /><br />

                    <p class="subheading">
                        Verifying your email address...
                    </p>

                    <br />

                </v-card-text>
            </v-card>
        </div>

        <!-- VERIFY EMAIL SUCCESS CARD -->
        <div v-if="display === 'success'">
            <v-card>
                <v-card-title class="secondary-bg">
                    <v-icon large left>verified_user</v-icon> 
                    <h2>Verify Email</h2>
                </v-card-title>
                <v-card-text style="text-align: center">

                    <br />

                    <v-icon large>verified_user</v-icon>

                    <br /><br />

                    <p class="subheading">
                        Email Verified!
                    </p>

                    <br />

                    <v-btn @click="cancel" :disabled.sync="verifying" color="primary" outline>
                        <v-icon>cancel</v-icon>&nbsp;&nbsp;Close
                    </v-btn>

                </v-card-text>
            </v-card>
        </div>

        <!-- VERIFY EMAIL ERROR CARD -->
        <div v-if="display === 'error'">
            <v-card>
                <v-card-title class="secondary-bg">
                    <v-icon large left>verified_user</v-icon> 
                    <h2>Verify Email</h2>
                </v-card-title>
                <v-card-text style="text-align: center">

                    <br />

                    <v-icon large>error</v-icon>

                    <br /><br />

                    <p class="subheading">
                        <strong>Email Address Not Verified</strong>
                        <br />
                        {{ errorMessage }}
                    </p>

                    <br />

                    <v-btn @click="cancel" :disabled.sync="verifying" color="primary" outline>
                        <v-icon>cancel</v-icon>&nbsp;&nbsp;Close
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
                isLoggedIn: true,
                email: undefined,
                token: undefined,
                requesting: false,
                verifying: false,
                request_resp: undefined
            }
        },

        // ==== COMPONENT FUNCTIONS ==== //
        methods: {

            /**
             * Redirect to the source page
             */
            cancel() {
                this.$router.push({
                    path: this.src ? this.src : (this.agencyId ? '/' + this.agencyId : '/')
                });
            },

            /**
             * Start the email verification process
             */
            request() {
                let vm = this;
                vm.requesting = true;
                
                // Request Email Verification
                user.requestEmailVerification(vm.agencyId, vm.src, function(err, resp) {
                    vm.requesting = false;
                    if ( err ) {
                        vm.$emit('showSnackbar', err.message);
                    }
                    else {
                        vm.request_resp = resp;
                        vm.display = "sent";
                    }
                });
            },

            /**
             * Verify the token
             */
            verify() {
                let vm = this;
                vm.verifying = true;

                // Pause for a sec
                setTimeout(function() {

                    // Verify Token
                    user.verifyEmail(vm.token, function(err) {
                        vm.verifying = false;
                        if ( err ) {
                            vm.errorMessage = err.message;
                            vm.display = "error";
                        }
                        else {
                            vm.display = "success";
                        }
                    });

                }, 2000);
            }

        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            let vm = this;
            vm.agencyId = vm.$route.query.agency;
            vm.src = vm.$route.query.src;
            vm.token = vm.$route.query.token;
            if ( vm.token ) {
                vm.display = "verify";
                vm.verify();
            }
            user.isLoggedIn(function(isLoggedIn, user) {
                vm.isLoggedIn = isLoggedIn;
                if ( isLoggedIn ) {
                    vm.email = user.email;
                }
                else {
                    vm.display = "login";
                }
            });
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
</style>