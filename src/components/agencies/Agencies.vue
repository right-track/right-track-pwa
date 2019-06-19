<template>
    <v-container class="container">

        <!-- SERVER MESSAGES -->
        <rt-messages></rt-messages>

        <!-- AGENCY SELECTION CARD -->
        <v-card>
            <v-card-title>
                <h2 class="display-2">{{ title }}</h2>
                <span class="subheading font-weight-light v-xsmall-hide">Select an Agency for schedules and status information:</span>
            </v-card-title>
            <rt-agency-list :agencies="agencies"></rt-agency-list>
        </v-card>

        <!-- Right Track Information -->
        <rt-info></rt-info>

    </v-container>
</template>


<script>
    const config = require("@/utils/config.js");
    const cache = require("@/utils/cache.js");
    const AgencyList = require("@/components/agencies/AgencyList.vue").default;
    const Info = require("@/components/agencies/Info.vue").default;
    const Messages = require("@/components/app/Messages.vue").default;



    /**
     * Update the list of agencies (and their icons) used by the vue component
     * @param  {Vue Instance} vm The current Vue Component Instance
     */
    function _updateAgencies(vm) {

        // Get Agencies from cache
        cache.getAgencies(function(err, agencies) {
            if ( err ) {
                console.log(err);
                vm.$emit('showSnackbar', "Could not load agency list. Please try again later.");
                vm.agencies = [];
            }
            else {
                vm.agencies = agencies;
                for ( i in vm.agencies ) {
                    let index = i;
                    cache.getAgencyIcon(vm.agencies[index].id, function(err, response) {
                        if ( err ) {
                            vm.agencies[index].icon = config.api.host + "/about/agencies/" + vm.agencies[index].id + "/icon";
                        }
                        else {
                            vm.agencies[index].icon = "data:image/png;base64, " + response;
                        }
                    });
                }
            }
        });

    }

    
    
    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {

                // Site Title
                title: config.title,

                // List of supported agencies
                agencies: []

            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-agency-list': AgencyList,
            'rt-info': Info,
            'rt-messages': Messages
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted: function() {

            // Update the list of agencies
            _updateAgencies(this);

            // Clear Title
            this.$emit('setTitle', undefined);

            // Set More Menu Items
            this.$emit('setMoreMenuItems', []);

        }

    }
</script>


<style scoped>
    .v-card {
        padding: 20px 25px 25px 25px;
    }
    .server-info {
        margin-top: 15px;
        text-align: center;
    }
</style>
