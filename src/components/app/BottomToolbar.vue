<template>
    <v-toolbar v-if="properties.visible" class="bottom-toolbar secondary-bg" flat dense></v-toolbar>
</template>

<script>
    module.exports = {
        props: {
            properties: {
                type: Object,
                required: true
            }
        }
    }
</script>

<style scoped>
    .bottom-toolbar {
        position: fixed !important;
        bottom: 0;
        width: 100%;
    }
</style>