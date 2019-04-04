<template>
    <md-bottom-bar class="md-xsmall-show rt-secondary" md-type="fixed" :md-active-item="'bottom-bar-item-' + page">
        <md-bottom-bar-item 
            id="bottom-bar-item-favorites"
            class="rt-secondary-text"
            md-label="Favorites" 
            md-icon="star"
            @click="onBottomBarItemSelected('favorites')">
        </md-bottom-bar-item>
        <md-bottom-bar-item 
            id="bottom-bar-item-trips" 
            class="rt-secondary-text"
            md-label="Trips" 
            md-icon="train"
            @click="onBottomBarItemSelected('trips')">
        </md-bottom-bar-item>
        <md-bottom-bar-item 
            id="bottom-bar-item-stations" 
            class="rt-secondary-text"
            md-label="Stations" 
            md-icon="access_time"
            @click="onBottomBarItemSelected('stations')">
        </md-bottom-bar-item>
        <md-bottom-bar-item 
            id="bottom-bar-item-agencyAlerts" 
            class="rt-secondary-text"
            md-label="Alerts" 
            md-icon="check_circle"
            @click="onBottomBarItemSelected('agencyAlerts')">
        </md-bottom-bar-item>
    </md-bottom-bar>
</template>


<script>
    module.exports = {
        data: function() {
            return {
                page: this.$router.currentRoute.name
            }
        },
        methods: {
            onBottomBarItemSelected(page) {
                this.$router.push({name: page});
            }
        }
    }
</script>


<style scoped>
    .md-bottom-bar {
        position: fixed;
        bottom: 0;
        width: 100%;
        z-index: 500;
    }
</style>