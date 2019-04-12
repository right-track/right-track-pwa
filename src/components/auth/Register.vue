<template>
    <v-container class="container">
        
        <!-- REGISTRATION CARD -->
        <v-card>
            <v-card-title class="secondary-bg">
                <v-icon large left>person_add</v-icon> 
                <h2>Create Account</h2>
            </v-card-title>
            <v-card-text>
                <p class="subheading">
                    Create a <strong>Right Track Account</strong> to sync your favorites across devices.
                </p>

                <br />

                <v-form v-model="valid" ref="form">

                    <!-- User Email -->
                    <v-text-field box
                        prepend-icon="email"
                        label="Email Address"
                        :hint="emailHint"
                        type="email"
                        v-model="email"
                        :rules="[validate.email]"
                        validate-on-blur
                        @keyup.enter="register">
                    </v-text-field>

                    <br />

                    <!-- Username -->
                    <v-text-field box
                        prepend-icon="person"
                        label="Username"
                        :hint="usernameHint"
                        v-model="username"
                        :rules="[validate.username]"
                        @keyup.enter="register">
                    </v-text-field>

                    <br />

                    <!-- User Password -->
                    <v-text-field box
                        prepend-icon="lock"
                        label="Password"
                        :hint="passwordHint"
                        type="password"
                        v-model="password"
                        :rules="[validate.password]"
                        @keyup.enter="register">
                    </v-text-field>

                    <br />

                    <!-- Buttons -->
                    <div class="button-container">
                        <div class="button-register">
                            <v-btn @click="register" color="primary" :disabled="!valid">
                                <v-icon>person_add</v-icon> Create Account
                            </v-btn>
                        </div>
                        <div class="button-login">
                            <v-btn @click="login" color="primary" outline>
                                <v-icon>person_outline</v-icon> Log In
                            </v-btn>
                        </div>
                    </div>

                </v-form>
            </v-card-text>
        </v-card>

    </v-container>
</template>


<script>
    const api = require("@/utils/api.js");

    /**
     * Get the registration requirements and set the rules
     * @param  {Vue} vm Vue Instance
     */
    _getRegistrationRequirements = function(vm) {
        console.log("Getting Registration Requirements...");
        api.options("/users", function(err, response) {
            console.log(err);
            if ( !err ) {
                console.log(response);
            }
        });
    }


    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: undefined,
                src: undefined,
                valid: undefined,
                email: undefined,
                username: undefined,
                password: undefined,
                emailHint: "Your email will only be used for account recovery purposes",
                usernameHint: undefined,
                passwordHint: undefined,
                validate: {
                    email: function(value) {
                        if ( !value ) {
                            return 'Required'
                        }
                        else {
                            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                            return pattern.test(value) || 'E-mail must be valid';
                        }
                    },
                    username: function(value) {
                        if ( !value ) {
                            return 'Required';
                        }
                        else {
                            return true;
                        }
                    },
                    password: function(value) {
                        if ( !value ) {
                            return 'Required';
                        }
                        else {
                            return true;
                        }
                    }
                }
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
             * Attempt to register the new user
             */
            register() {
                console.log("TODO: Account Registration");
            }

        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            this.agencyId = this.$route.query.agency;
            this.src = this.$route.query.src;
            _getRegistrationRequirements(this);
        }

    }
</script>


<style scoped>
    .button-container {
        display: grid;
        grid-gap: 10px;
        grid-template-columns: 1fr;
        grid-template-areas: "register" "login";
    }
    @media (min-width: 600px) {
        .button-container {
            grid-template-columns: 1fr 1fr;
            grid-template-areas: "login register";
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
</style>