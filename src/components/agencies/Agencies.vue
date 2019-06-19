<template>
    <v-container class="container">

        <!-- SERVER MESSAGES -->
        <template v-for="message in messages">
            <v-alert :key="message.id" :value="true" dismissible
                    color="warning" transition="scale-transition"
                    @input="dismiss">
                <h2>{{message.title}}</h2>
                <span v-html="message.body"></span>
                <v-btn v-if="message.linkTitle && message.linkUrl" :href="message.linkUrl" block>
                    {{message.linkTitle}}
                </v-btn>
            </v-alert>
            <br />
        </template>

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
    const messages = require("@/utils/messages.js");
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
    

    /**
     * Display any non-dismissed Messages from the API Server
     * @param  {Vue} vm Vue Instance
     */
    function _setMessages(vm) {
        messages.getMessages(function(err, messages) {
            vm.messages = messages;
        });
    }
    
    
    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {

                // Site Title
                title: config.title,

                // List of supported agencies
                agencies: [],

                // List of Server Messages
                messages: []

            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-agency-list': AgencyList,
            'rt-info': Info
        },

        // ==== COMPONENT METHODS ==== //
        methods: {
            dismiss: function(v) {
                console.log("DISMISS");
                console.log(v);
            }
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted: function() {

            // Update the list of agencies
            _updateAgencies(this);

            // Clear Title
            this.$emit('setTitle', undefined);

            // Set More Menu Items
            this.$emit('setMoreMenuItems', []);

            // Set the Messages
            _setMessages(this);

        }

    }
</script>


<style scoped>
    .v-alert {
        width: 85%;
    }
    .v-card {
        padding: 20px 25px 25px 25px;
    }
    .server-info {
        margin-top: 15px;
        text-align: center;
    }
</style>
