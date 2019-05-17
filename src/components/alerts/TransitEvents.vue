<template>
    <div v-if="transitEvents && transitEvents.length > 0">
        <v-card class="event-card" v-for="(event, index) in transitEvents" :key="index">

            <v-card-title class="secondary-bg">
                <span class="headline">
                    {{ event.status }}
                </span>
            </v-card-title>

            <v-card-text class="event-details" v-html="event.details"></v-card-text>

        </v-card>
    </div>
</template>


<script>

    module.exports = {

        // ==== COMPONENT PROPS ===== //
        props: {
            transitAgency: Object,
            transitDivision: Object,
            transitLine: Object,
            transitEvents: Array,
            feed: Object
        }

    }

</script>


<style scoped>
    .event-card {
        margin-bottom: 40px;
    }
</style>