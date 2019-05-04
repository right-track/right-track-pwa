<template>
    <v-bottom-nav class="secondary-bg" :value.sync="display" :active.sync="page" v-resize="onResize" fixed>
        <v-btn value="favorites" @click="onBottomBarItemSelected('favorites')" flat>
            <span>Favorites</span>
            <v-icon>star</v-icon>
        </v-btn>
        <v-btn value="trips" @click="onBottomBarItemSelected('trips')" flat>
            <span>Trips</span>
            <v-icon>train</v-icon>
        </v-btn>
        <v-btn value="stations" @click="onBottomBarItemSelected('stations')" flat>
            <span>Stations</span>
            <v-icon>access_time</v-icon>
        </v-btn>
        <v-btn value="alerts" @click="onBottomBarItemSelected('alerts')" flat>
            <span>Alerts <template v-if="transitAlertCount && transitAlertCount > 0"> ({{ transitAlertCount }})</template></span>
            <v-icon v-if="transitAlertCount && transitAlertCount > 0">warning</v-icon>
            <v-icon v-else>check_circle</v-icon>
        </v-btn>
    </v-bottom-nav>
</template>


<script>
    const BREAK_POINT = 960;

    module.exports = {

        // ==== COMPONENT PROPS ==== //
        props: {
            transitAlertCount: {
                type: Number,
                default: 0
            }
        },

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                display: true,
                page: this.$router.currentRoute.name
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {
            onBottomBarItemSelected(page) {
                this.$router.push({
                    name: page, 
                    params: {
                        agency: this.$router.currentRoute.params.agency
                    }
                });
            },
            onResize() {
                if ( window.innerWidth < BREAK_POINT ) {
                    this.display = true;
                }
                else {
                    this.display = false;
                }
            }
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {
            $route: function(to, from) {
                this.page = to.name;
            }
        }

    }
</script>
