<template>
    <div class="content-container">

        <!-- AGENCY SELECTION CARD -->
        <md-card>
            
            <!-- Card Header -->
            <md-card-header>
                <h1 class="agency-card-header-text md-xsmall-hide">{{ title }}</h1>
                <h1 class="agency-card-header-text-xs md-xsmall-show">{{ title }}</h1>
                <h2 class="agency-card-subheading-text md-xsmall-hide">Select an Agency for schedules and status information:</h2>
            </md-card-header>

            <!-- Card Content / Agency List -->
            <md-card-content class="agency-card-content">
                <rt-agency-list :agencies="agencies"></rt-agency-list>
            </md-card-content>

        </md-card>

        <!-- Right Track Information -->
        <rt-info></rt-info>

    </div>
</template>


<script>
    const config = require("../../utils/config.js");
    const cache = require("../../utils/cache.js");
    const AgencyList = require("./AgencyList.vue").default;
    const Info = require("./Info.vue").default;



    /**
     * Update the list of agencies (and their icons) used by the vue component
     * @param  {Vue Instance} vm The current Vue Component Instance
     */
    function _updateAgencies(vm) {

        // Get Agencies from cache
        cache.getAgencies(function(err, agencies) {

            // ERROR: Could not get agencies
            if ( err ) {
                console.log(err);
                vm.$emit('showSnackbar', "Could not load agency list. Please try again later.");
                vm.agencies = [];
            }

            // Update Agencies
            else {
                vm.agencies = agencies;

                // Update the Agency Icons
                for ( i in vm.agencies ) {
                    let index = i;

                    // Get Agency Icon from cache
                    cache.getAgencyIcon(vm.agencies[index].id, function(err, response) {

                        // ERROR: use API URL
                        if ( err ) {
                            vm.agencies[index].icon = config.api.host + "/about/agencies/" + vm.agencies[index].id + "/icon";
                        }

                        // Set agency icon to base64 data
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
            'rt-info': Info
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted: function() {

            // Update the list of agencies
            _updateAgencies(this);

            // Set More Menu Items and Clear Agency ID
            this.$emit('setMoreMenuItems', []);
            this.$emit('setAgencyId', undefined);

        }

    }
</script>


<style scoped>
    .agency-card-header-text, .agency-card-header-text-xs {
        font-weight: normal;
        font-size: 36px;
        line-height: 36px;
        margin-bottom: 0;
    }
    .agency-card-header-text-xs {
        margin-left: -25px;
        margin-right: -25px;
        text-align: center;
    }
    .agency-card-subheading-text {
        font-weight: normal;
        font-size: 16px;
        color: #666;
    }
    
    .agency-card-content {
        padding: 0;
    }

    .server-info {
        margin-top: 15px;
        text-align: center;
    }
</style>
