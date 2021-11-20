<template>
    <div>
        <div class="event-card-list" v-if="hasEvents">
            <v-card class="event-card" v-for="(event, index) in transitEvents" :key="index">
                <v-card-title class="secondary-bg">
                    <span class="headline">
                        {{ event.status }}
                    </span>
                </v-card-title>
                <v-card-text class="event-details" v-html="event.details"></v-card-text>
            </v-card>
        </div>
    </div>
</template>


<script>

    module.exports = {

        // ==== COMPONENT PROPS ===== //
        props: {
            transitDivision: Object,
        },

        // ==== COMPUTED DATA ==== //
        computed: {

            /**
             * Boolean flag for if the division has events
             */
            hasEvents: function() {
                return this.transitEvents && this.transitEvents.length > 0
            },

            /**
             * List of Transit Events for the selected Division
             */
            transitEvents: function() {
                return this.transitDivision.events;
            }

        }

    }

</script>


<style>
    .event-card-list {
        margin-top: 50px;
    }
    .event-card {
        margin-bottom: 40px;
    }

    .event-details-header {
        margin: -16px -16px 16px -16px;
        padding: 16px;
        background-color: #eee;
        border-bottom: 1px solid #ccc;
        font-weight: 500;
    }
    .event-details-description {}
    .event-details-info {
        margin: 16px -16px -16px -16px;
        padding: 16px;
        background-color: #eee;
        border-top: 1px solid #ccc;
    }
    .event-details-info p {
        margin: 0;
    }
</style>