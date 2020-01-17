<template>
    <div class="tab-item">
        <h3>Trip Searches:</h3>
        <p>Allow Transfers: <code>settings.search.allowTransfers = true</code></p>
        <p>Allow Change in Direction: <code>settings.search.allowChangeInDirection = true</code></p>
        <p>Pre-Departure Hours: <code>settings.search.preDepartureHours = 3</code></p>
        <p>Post-Departure Hours: <code>settings.search.postDepartureHours = 6</code></p>
        <p>Max Layover Mins: <code>settings.search.maxLayoverMins = 30</code></p>
        <p>Min Layover Mins: <code>settings.search.minLayoverMins = 0</code></p>
        <p>Max Transfers: <code>settings.search.maxTransfers = 2</code></p>
    </div>
</template>



<script>
    module.exports = {

        // ==== COMPONENT PROPERTIES ==== //
        props: {
            agencyId: {
                type: [String],
                required: true
            },
            settings: {
                type: Object,
                required: true
            },
            isLoggedIn: {
                type: Boolean,
                required: true
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {}
        
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
</style>