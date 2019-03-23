<template>
    <div class="content-container">
        
        <md-card>
            <md-card-header class="md-card-header-bg rt-secondary">
                <div class="md-title">
                    <md-icon>person_add</md-icon>
                    Create Account
                </div>
            </md-card-header>
            <md-card-content>
                <p class="info">
                    Create a <strong>Right Track Account</strong> to sync your favorites across devices.
                </p>

                <!-- User Email -->
                <md-field>
                    <md-icon>email</md-icon>
                    <label>Email</label>
                    <md-input v-model="email"></md-input>
                    <span class="md-helper-text">{{ emailHelperText }}</span>
                </md-field>

                <!-- User Email -->
                <md-field>
                    <md-icon>person</md-icon>
                    <label>Username</label>
                    <md-input v-model="username"></md-input>
                    <span class="md-helper-text">{{ usernameHelperText }}</span>
                </md-field>

                <!-- User Password -->
                <md-field :md-toggle-password="false">
                    <md-icon>lock</md-icon>
                    <label>Password</label>
                    <md-input v-model="password" type="password"></md-input>
                    <span class="md-helper-text">{{ passwordHelperText }}</span>
                </md-field>

                <!-- Buttons -->
                <div class="md-layout">
                    <div class="md-layout-item md-small-size-100 md-small-show"  style="text-align: center">
                        <md-button class="md-raised rt-primary" @click="register"><md-icon>person_add</md-icon> Create Account</md-button>
                    </div>
                    <div class="md-layout-item md-small-size-100" style="text-align: center">
                        <md-button class="md-flat rt-primary-fg" @click="login"><md-icon>person_outline</md-icon> Log In</md-button>
                    </div>
                    <div class="md-layout-item md-small-size-100 md-small-hide"  style="text-align: center">
                        <md-button class="md-raised rt-primary" @click="register"><md-icon>person_add</md-icon> Create Account</md-button>
                    </div>
                </div>

            </md-card-content>
        </md-card>

    </div>
</template>


<script>
    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                src: undefined,
                email: undefined,
                username: undefined,
                password: undefined,
                emailHelperText: "Your email will only be used for account recovery purposes",
                usernameHelperText: undefined,
                passwordHelperText: undefined
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
            }

        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            let agencyId = this.$route.query.agency;
            let src = this.$route.query.src;

            // Set redirect source
            this.src = src;

            // Set More Menu Items and Agency Information
            this.$emit('setMoreMenuItems', []);
            this.$emit('setAgencyId', agencyId);    
        }

    }
</script>


<style scoped>
    .md-helper-text {
        margin-left: 35px;
    }
</style>