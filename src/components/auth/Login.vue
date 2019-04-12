<template>
    <v-container class="container">
        
        <!-- LOGIN CARD -->
        <v-card>
            <v-card-title class="secondary-bg">
                <v-icon large left>person_outline</v-icon> 
                <h2>Log In</h2>
            </v-card-title>
            <v-card-text>
                <p class="subheading">
                    Log in to your <strong>Right Track Account</strong> using either your <em>username</em> or 
                    <em>email address</em>.
                </p>

                <br />

                <v-form v-model="valid" ref="form">

                    <!-- User login -->
                    <v-text-field box
                        prepend-icon="person"
                        label="Username or Email"
                        type="email"
                        v-model="user"
                        :rules="[rules.required]"
                        @keyup.enter="login">
                    </v-text-field>

                    <br />

                    <!-- User Password -->
                    <v-text-field box
                        prepend-icon="lock"
                        label="Password"
                        type="password"
                        v-model="pass"
                        :rules="[rules.required]"
                        @keyup.enter="login">
                    </v-text-field>

                    <br />

                    <!-- Buttons -->
                    <div class="button-container">
                        <div class="button-login">
                            <v-btn @click="login" :disabled="!valid || loggingIn" color="primary">
                                <v-icon>person_outline</v-icon> Log In
                            </v-btn>
                        </div>
                        <div class="button-register">
                            <v-btn @click="register" :disabled.sync="loggingIn" color="primary" outline>
                                <v-icon>person_add</v-icon> Create Account
                            </v-btn>
                        </div>
                    </div>

                </v-form>
            </v-card-text>
            
        </v-card>

    </v-container>
</template>


<script>
    const user = require("@/utils/user.js");

    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: undefined,
                src: undefined,
                valid: undefined,
                user: null,
                pass: null,
                loggingIn: false,
                rules: {
                    required: function(value) {
                       return !!value || 'Required';
                    }
                }
            }
        },

        // ==== COMPONENT FUNCTIONS ==== //
        methods: {

            /**
             * Redirect to the Registration page
             */
            register() {
                this.$router.push({
                    name: "register",
                    query: {
                        agency: this.agencyId,
                        src: this.src
                    }
                });
            },

            /**
             * Start the login process
             */
            login() {
                if ( this.$refs.form.validate() ) {
                    let vm = this;
                    vm.loggingIn = true;
                    
                    // Attempt to Login
                    user.login(this.user, this.pass, function(err, userInfo) {
                        vm.loggingIn = false;

                        // Login Error
                        if ( err ) {
                            vm.$emit('showSnackbar', err.message);
                        }

                        // Login Successful
                        else {
                            vm.$emit('showSnackbar', "Welcome, " + userInfo.username + "!");
                            vm.$router.push({path: vm.src});
                        }
                    });
                }
            }

        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            this.agencyId = this.$route.query.agency;
            this.src = this.$route.query.src;
        }

    }
</script>


<style scoped>
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
</style>