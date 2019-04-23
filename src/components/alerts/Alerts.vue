<template>
    <v-container class="container">

        <!-- ALERTS CARD -->
        <v-card>
            <v-card-title class="secondary-bg">
                <span class="headline">
                    <v-icon v-if="icon">{{ icon }}</v-icon>
                    <img class="icon-img" :src="img" v-if="img" />
                    &nbsp;&nbsp;{{ title }}
                </span>
                <v-spacer></v-spacer>
                <span class="subheading" v-if="transitFeedUpdated">
                    <v-icon style="font-size: 20px">update</v-icon>&nbsp;&nbsp;{{ transitFeedUpdated }}
                </span>
            </v-card-title>
            <rt-transit-list 
                :transitAgencies="transitAgencies"
                @setTitle="onSetTitle" 
                @setIcon="onSetIcon" 
                v-if="!transitAgencyId">
            </rt-transit-list>
            <rt-transit-agency 
                :transitAgency="transitAgency"
                :feed="transitFeed"
                @setTitle="onSetTitle" 
                @setIcon="onSetIcon" 
                v-if="transitAgencyId && !transitDivisionCode && !transitLineCode">
            </rt-transit-agency>
            <rt-transit-division 
                :transitAgency="transitAgency"
                :feed="transitFeed"
                @setTitle="onSetTitle" 
                @setIcon="onSetIcon" 
                v-if="transitAgencyId && transitDivisionCode && !transitLineCode">
            </rt-transit-division>
            <rt-transit-line 
                :transitAgency="transitAgency"
                :feed="transitFeed"
                @setTitle="onSetTitle" 
                @setIcon="onSetIcon" 
                v-if="transitAgencyId && transitDivisionCode && transitLineCode">
            </rt-transit-line>
        </v-card>

    </v-container>
</template>

<script>
    const DateTime = require("right-track-core").utils.DateTime;
    const cache = require("@/utils/cache.js");

    const TransitList = require("@/components/alerts/TransitList.vue").default;
    const TransitAgency = require("@/components/alerts/TransitAgency.vue").default;
    const TransitDivision = require("@/components/alerts/TransitDivision.vue").default;
    const TransitLine = require("@/components/alerts/TransitLine.vue").default;


    /**
     * Set the agency and transit params from the path
     * @param {Vue} vm Vue Instance
     */
    function _setParams(vm) {
        vm.agencyId = vm.$router.currentRoute.params.agency;
        vm.transitAgencyId = vm.$router.currentRoute.params.transitAgency;
        vm.transitDivisionCode = vm.$router.currentRoute.params.transitDivision;
        vm.transitLineCode = vm.$router.currentRoute.params.transitLine;
    }


    /**
     * Update the list of Transit Agencies
     * @param  {Vue} vm Vue Instance
     */
    function _getTransitAgencies(vm) {
        console.log("==> GET TRANSIT AGENCIES");
        cache.getTransitAgencies(function(err, transitAgencies) {
            if ( err ) {
                vm.$emit('showSnackbar', 'Could not load transit agencies. Please try again later.');
            }
            else {
                vm.transitAgencies = transitAgencies;
                _setTransitAgency(vm);
            }
        });
    }


    /**
     * Set the current Transit Agency
     * @param {Vue} vm Vue Instance
     */
    function _setTransitAgency(vm) {
        vm.transitAgency = undefined;
        if ( vm.transitAgencyId && vm.transitAgencies ) {
            for ( let i = 0; i < vm.transitAgencies.length; i++ ) {
                if ( vm.transitAgencies[i].id === vm.transitAgencyId ) {
                    vm.transitAgency = vm.transitAgencies[i];
                }
            }
        }
    }


    /**
     * Get the Transit information for the specified agency
     * @param  {string}   agencyId Agency ID Code
     * @param  {Function} callback Callback function(err, transit)
     */
    function _getAgencyTransitInfo(agencyId, callback) {
        cache.getAgencies(function(err, agencies) {
            if ( err ) {
                return callbacK(err);
            }
            for ( let i = 0; i < agencies.length; i++ ) {
                if ( agencies[i].id === agencyId ) {
                    return callback(null, agencies[i].config.transit);
                }
            }
        });
    }

    /**
     * Display the default Transit Agency and Transit Division, 
     * if specified, for the current agency
     * @param  {Vue} vm Vue Instance
     */
    function _displayAgencyDefault(vm) {
        _getAgencyTransitInfo(vm.agencyId, function(err, transit) {
            if ( transit ) {
                vm.$router.replace({
                    name: "alerts",
                    params: {
                        "agency": vm.agencyId,
                        "transitAgency": transit.agency,
                        "transitDivision": transit.division
                    }
                });
            }
        });
    }


    /**
     * Update Transit Feed
     * @param  {Vue} vm Vue Instance
     */
    function _updateFeed(vm, force) {
        if ( vm.transitAgencyId ) {
            vm.transitFeedUpdating = true;
            cache.getTransitFeed(vm.transitAgencyId, function(err, feed) {
                vm.transitFeedUpdating = false;
                if ( err ) {
                    if ( force ) vm.$emit('showSnackbar', 'Could not update transit feed. Please try again later.');
                }
                else {
                    vm.transitFeed = feed;
                    vm.transitFeedUpdated = DateTime.createFromJSDate(new Date(feed.updated)).getTimeReadable();
                }
            });
        }
    }


    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: undefined,
                transitAgencyId: undefined,
                transitDivisionCode: undefined,
                transitLineCode: undefined,
                title: undefined,
                icon: undefined,
                img: undefined,
                transitAgencies: [],
                transitAgency: undefined,
                transitFeed: undefined,
                transitFeedUpdating: false,
                transitFeedUpdated: undefined
            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-transit-list': TransitList,
            'rt-transit-agency': TransitAgency,
            'rt-transit-division': TransitDivision,
            'rt-transit-line': TransitLine
        },

        // ==== COMPONENT METHODS ==== //
        methods: {
            onSetTitle(title) {
                this.title = title;
            },
            onSetIcon(icon, type) {
                this.icon = icon;
            }
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {

            // Set Path Params
            _setParams(this);

            // Get Transit Agencies
            _getTransitAgencies(this);

            // Redirect to Default Agency Feed
            if ( this.agencyId && !this.transitAgencyId ) {
                _displayAgencyDefault(this);
            }

            // Update Transit Feed
            else {
                if ( this.transitAgencyId ) {
                    _updateFeed(this);
                }
                else {
                    this.transitFeed = undefined;
                    this.transitFeedUpdated = undefined;
                }
            }
            
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {
            $route: function(to, from) {
                _setParams(this);
                if ( !this.transitAgencyId ) {
                    this.transitFeed = undefined;
                    this.transitFeedUpdated = undefined;
                }
            },

            transitAgencyId: function() {
                _updateFeed(this);
                _setTransitAgency(this);
            },

            transitFeedUpdating: function() {
                this.$emit('setProgress', this.transitFeedUpdating);
            }
        }

    }

</script>


<style scoped>
    .v-card-text {
        padding: 0;
    }
</style>