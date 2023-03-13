<template>
    <v-container class="container container-padded">
        <div class="empty-state">
            <v-icon class="empty-state-icon">contact_support</v-icon>

            <p class="display-2">Page Not Found</p>

            <p class="subheading">Uh Oh! The page you requested could not be found.</p>

            <br /><br />

            <v-btn @click="agencyList" color="primary">
                List of Supported Agencies
            </v-btn>

        </div>
    </v-container>
</template>


<script>
    module.exports = {
        mounted() {
            this.$emit('setTitle', 'Page Not Found');
        },
        methods: {
            agencyList: function() {
                this.$router.push({name: "agencies"});
            }
        }
    }
</script>


<style scoped>
    .empty-state {
        max-width: 500px;
        text-align: center;
        margin: auto;
    }
    .empty-state p {
        color: #111 !important;
    }
    .empty-state-icon {
        font-size: 160px;
        color: #333 !important;
    }
</style>