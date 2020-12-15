<template>
    <v-container id="container" class="container">

        <!-- Alerts Header -->
        <v-card id="header-card">
            <v-card-title class="secondary-bg">
                <span class="headline card-title">
                    <v-fade-transition hide-on-leave>
                        <v-icon v-if="icon" :key="icon">{{ icon }}</v-icon>
                    </v-fade-transition>
                    &nbsp;&nbsp;
                    <v-fade-transition hide-on-leave>        
                        <span :key="title">{{ title }}</span>
                    </v-fade-transition>
                </span>
                <v-spacer></v-spacer>
                <span class="subheading v-small-hide" v-if="transitFeedUpdated">
                    <v-icon style="font-size: 20px">update</v-icon>&nbsp;&nbsp;{{ transitFeedUpdated }}
                </span>
            </v-card-title>
            <div class="nav">
                <div v-for="(item, index) in nav" :key="'nav-item-' + index" class="nav-item">
                    <a @click="item.click">
                        <v-icon class="nav-icon">chevron_left</v-icon>
                        <span class="nav-label">{{ item.label }}</span>
                    </a>
                </div>
            </div>
        </v-card>


        <!-- Current Component -->
        <transition name="fade" mode="out-in">
            <component 
                id="current-component"
                :is="currentComponent"
                :transitAgencies="transitAgencies"
                :transitAgency="transitAgency"
                :transitDivision="transitDivision"
                :transitLine="transitLine"
                :feed="transitFeed"
                :key="currentComponent"
                @setCardTitle="onSetCardTitle" 
                @setCardIcon="onSetCardIcon" 
                @setNavItems="onSetNavItems">
            </component>
        </transition>


        <!-- Events List -->
        <transition name="slide-fade">
            <div id="rt-transit-events-wrapper"
                 v-if="transitAgencyId && transitDivisionCode && transitLineCode">
                <rt-transit-events
                    id="rt-transit-events"
                    :transitAgency="transitAgency"
                    :transitDivision="transitDivision"
                    :transitLine="transitLine"
                    :transitEvents="transitEvents"
                    :feed="transitFeed">
                </rt-transit-events>
            </div>
        </transition>

    </v-container>
</template>

<script>
    const DateTime = require("right-track-core").utils.DateTime;
    const cache = require("@/utils/cache.js");
    const transit = require("@/utils/transit.js");

    const TransitList = require("@/components/alerts/TransitList.vue").default;
    const TransitAgency = require("@/components/alerts/TransitAgency.vue").default;
    const TransitDivision = require("@/components/alerts/TransitDivision.vue").default;
    const TransitLine = require("@/components/alerts/TransitLine.vue").default;
    const TransitEvents = require("@/components/alerts/TransitEvents.vue").default;


    /**
     * Set the agency and transit params from the path
     * @param {Vue} vm Vue Instance
     */
    function _setParams(vm) {
        vm.agencyId = vm.$router.currentRoute.params.agency;
        vm.transitAgencyId = vm.$router.currentRoute.params.transitAgency;
        vm.transitDivisionCode = vm.$router.currentRoute.params.transitDivision;
        vm.transitLineCode = vm.$router.currentRoute.params.transitLine;

        if ( !vm.transitAgencyId ) {
            vm.currentComponent = "rt-transit-list";
        }
        else if ( vm.transitAgencyId && !vm.transitDivisionCode && !vm.transitLineCode ) {
            vm.currentComponent = "rt-transit-agency";
        }
        else if ( vm.transitAgencyId && vm.transitDivisionCode && !vm.transitLineCode ) {
            vm.currentComponent = "rt-transit-division";
        }
        else if ( vm.transitAgencyId && vm.transitDivisionCode && vm.transitLineCode ) {
            vm.currentComponent = "rt-transit-line";
        }
        else {
            vm.currentComponent = undefined;
        }
    }


    /**
     * Update the list of Transit Agencies
     * @param  {Vue} vm Vue Instance
     */
    function _getTransitAgencies(vm) {
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
     * Set the current Transit Division
     * @param {Vue} vm Vue Instance
     */
    function _setTransitDivision(vm) {
        vm.transitDivision = undefined;
        if ( vm.transitDivisionCode && vm.transitFeed ) {
            for ( let i = 0; i < vm.transitFeed.divisions.length; i++ ) {
                if ( vm.transitFeed.divisions[i].code === vm.transitDivisionCode ) {
                    vm.transitDivision = vm.transitFeed.divisions[i];
                }
            }
        }
    }


    /**
     * Set the current Transit Line
     * @param {Vue} vm Vue Instance
     */
    function _setTransitLine(vm) {
        vm.transitLine = undefined;
        vm.transitEvents = undefined;
        _setHeight(vm);
        if ( vm.transitDivisionCode && vm.transitLineCode && vm.transitFeed ) {
            for ( let i = 0; i < vm.transitFeed.divisions.length; i++ ) {
                if ( vm.transitFeed.divisions[i].code === vm.transitDivisionCode ) {
                    for ( let j = 0; j < vm.transitFeed.divisions[i].lines.length; j++ ) {
                        if ( vm.transitFeed.divisions[i].lines[j].code === vm.transitLineCode ) {
                            vm.transitLine = vm.transitFeed.divisions[i].lines[j];
                            vm.transitEvents = vm.transitLine.events;
                            _setHeight(vm);
                        }
                    }
                }
            }
        }
    }


    /**
     * Set the height of the page container
     * - based on height of events list, if present
     * @param {Vue} vm Vue Instance
     */
    function _setHeight(vm) {
        vm.$nextTick(function() {
            let cont = document.getElementById("container");
            let height = "auto";
            if ( vm.transitLineCode ) {
                let events = document.getElementById("rt-transit-events");
                if ( events ) {
                    height = events.offsetHeight + 300 + "px";
                }
            }
            cont.style.height = height;
        });
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
            transit.getFeed(vm.transitAgencyId, function(err, feed) {
                vm.transitFeedUpdating = false;
                if ( err ) {
                    if ( force ) vm.$emit('showSnackbar', 'Could not update transit feed. Please try again later.');
                }
                else {
                    vm.transitFeed = feed;
                    vm.transitFeedUpdated = DateTime.createFromJSDate(new Date(feed.updated)).getTimeReadable();
                    _setTransitDivision(vm);
                    _setTransitLine(vm);
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
                transitAgencies: [],
                title: undefined,
                icon: undefined,
                img: undefined,
                nav: [],
                currentComponent: undefined,
                transitAgency: undefined,
                transitDivision: undefined,
                transitLine: undefined,
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
            'rt-transit-line': TransitLine,
            'rt-transit-events': TransitEvents
        },

        // ==== COMPONENT METHODS ==== //
        methods: {
            onSetCardTitle(title) {
                this.title = title;
            },
            onSetCardIcon(icon, type) {
                this.icon = icon;
            },
            onSetNavItems(items) {
                this.nav = items;
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
                    _setTransitDivision(this);
                    _setTransitLine(this);
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
                _setHeight(this);
                if ( !this.transitAgencyId ) {
                    this.transitFeed = undefined;
                    this.transitFeedUpdated = undefined;
                }
            },

            transitAgencyId: function() {
                _updateFeed(this);
                _setTransitAgency(this);
            },

            transitDivisionCode: function() {
                _setTransitDivision(this);
            },

            transitLineCode: function() {
                _setTransitLine(this);
            },

            transitFeedUpdating: function() {
                this.$emit('setProgress', this.transitFeedUpdating);
            }
        }

    }

</script>


<style scoped>
    .container {
        padding-bottom: 80px;
    }

    #header-card {
        z-index: 2;
    }

    #header-card .card-title {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        display: inherit;
    }

    #current-component {
        z-index: 3;
    }
    
    #rt-transit-events-wrapper {
        position: absolute;
        top: 200px;
        left: 0;
        width: 100%;
        padding: 0 40px;
        z-index: 1;
    }
    #rt-transit-events {
        max-width: 600px;
        margin: 0 auto;
        height: auto;
    }

    .nav {
        width: 100%;
        background-color: #eee;
        padding-left: 5px;
        border-bottom: 1px solid #ccc;
    }
    .nav-item {
        display: inline;
    }
    .nav-icon {
        font-size: 15px;
    }
</style>