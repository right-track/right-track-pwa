<template>
    <div class="content-container">

        <!-- AGENCY SELECTION CARD -->
        <md-card>
            
            <!-- Card Header -->
            <md-card-header>
                <h1 class="agency-card-header-text">{{ title }}</h1>
                <h2 class="agency-card-subheading-text md-small-hide">Select an Agency for schedules and status information:</h2>
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
    const config = require("@/utils/config.js");
    const cache = require("@/utils/cache.js");
    const AgencyList = require("@/components/agencies/AgencyList.vue").default;
    const Info = require("@/components/agencies/Info.vue").default;



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
            'rt-info': Info
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
    .md-card-heading {
        padding: 0;
    }

    .agency-card-header-text {
        font-weight: normal;
        font-size: 36px;
        line-height: 36px;
        margin-bottom: 0;
        margin-right: 30px;
        text-align: center;
    }
    @media (min-width: 600px) {
        .agency-card-header-text {
            text-align: left;
        }
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
