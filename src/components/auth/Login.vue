<template>
    <div class="content-container">
        
        <!-- LOGIN CARD -->
        <md-card>
            <md-card-header class="md-card-header-bg rt-secondary">
                <div class="md-title">
                    <md-icon>person_outline</md-icon>
                    Log In
                </div>
            </md-card-header>
            <md-card-content>
                <p class="info">
                    Log in to your <strong>Right Track Account</strong> using either your <em>username</em> or 
                    <em>email address</em>.
                </p>

                <!-- User login -->
                <md-field>
                    <md-icon>person</md-icon>
                    <label>Username or Email</label>
                    <md-input v-model="user" @keyup.enter="login"></md-input>
                </md-field>

                <!-- User Password -->
                <md-field :md-toggle-password="false">
                    <md-icon>lock</md-icon>
                    <label>Password</label>
                    <md-input v-model="pass" type="password" @keyup.enter="login"></md-input>
                </md-field>

                <!-- Buttons -->
                <div class="md-layout">
                    <div class="md-layout-item md-small-size-100 md-small-show"  style="text-align: center">
                        <md-button class="md-raised rt-primary" @click="login" :disabled.sync="loggingIn"><md-icon>person_outline</md-icon> Log In</md-button>
                    </div>
                    <div class="md-layout-item md-small-size-100" style="text-align: center">
                        <md-button class="md-flat rt-primary-fg" @click="register" :disabled.sync="loggingIn"><md-icon>person_add</md-icon> Create Account</md-button>
                    </div>
                    <div class="md-layout-item md-small-size-100 md-small-hide"  style="text-align: center">
                        <md-button class="md-raised rt-primary" @click="login" :disabled.sync="loggingIn"><md-icon>person_outline</md-icon> Log In</md-button>
                    </div>
                </div>
            </md-card-content>
        </md-card>

    </div>
</template>


<script>
    const user = require("@/utils/user.js");

    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: undefined,
                src: undefined,
                user: null,
                pass: null,
                loggingIn: false
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

        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            this.agencyId = this.$route.query.agency;
            this.src = this.$route.query.src;

            // Set More Menu Items and Agency Information
            this.$emit('setMoreMenuItems', []);
            this.$emit('setAgencyId', this.agencyId);    
        }

    }
</script>


<style scoped>
    p.info {
        font-size: 140%;
        color: #333;
    }
    .md-button {
        width: 75%;
    }
</style>