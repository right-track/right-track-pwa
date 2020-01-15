<template>
    <v-container class="container">

        <!-- HELP CARD -->
        <v-card>
            <v-card-title class="headline secondary-bg">
                <v-icon>settings</v-icon>&nbsp;&nbsp;Settings
            </v-card-title>

            <v-card-text class="card-content">

                <v-tabs grow
                    height="40"
                    color="secondary-bg"
                    icons-and-text="icons">
                
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


                    <!-- Update Settings -->
                    <v-tab-item class="tab-item">
                        <h3>Schedule Updates</h3>
                        <p>Check for Updates Automatically: <code>settings.updates.autoCheck = true</code></p>
                        <p>Reset Database: clear and download latest</p>
                        <p>Restore Database: clear and download archive</p>
                    </v-tab-item>

                    <!-- Trip Settings -->
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

                    <!-- Account Settings -->
                    <v-tab-item class="tab-item">
                        <h3>User Accounts</h3>
                        <p>Update Username:</p>
                        <p>Update Email Address: Verify</p>
                        <p>Update Password:</p>
                        <p>Delete Account:</p>
                    </v-tab-item>

                </v-tabs>

            </v-card-text>
        </v-card>
    </v-container>
</template>


<script>
    
</script>


<style scoped>
    
    .card-content {
        padding: 0 0 16px 0;
    }

    .tab-item {
        padding: 16px;
    }
    .tab-item > h3 {
        border-bottom: 1px solid #999;
    }
    .tab-item p {
        margin: 10px 5px;
    }
</style>