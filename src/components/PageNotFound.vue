<template>
    <div class="content-container">
        <md-empty-state md-icon="contact_support" md-label="Page Not Found">
            <p class="md-empty-state-description">
                Uh Oh!<br />The page you requested could not be found.
            </p>
            <p class="md-empty-state-description">
                <md-button class="md-raised rt-primary" @click="agencyList">View Supported Agencies</md-button>
            </p>
        </md-empty-state>
    </div>
</template>

<script>
    module.exports = {
        mounted() {
            this.$emit('setMoreMenuItems', []);
            this.$emit('setAgencyId', this.$route.params.agency);
            this.$emit('setTitle', 'Page Not Found');
        },

        methods: {
            agencyList: function() {
                this.$router.push({name: "agencies"});
            }
        }
    }
</script>