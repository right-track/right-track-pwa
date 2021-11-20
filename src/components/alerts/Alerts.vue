<template>
    <v-container id="container" class="container">

        <!-- Main Alerts Card - Agency / Division List -->
        <v-card>

            <!-- Alerts Header -->
            <div id="header-card">
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
                <div class="nav" v-if="nav && nav.length > 0">
                    <div v-for="(item, index) in nav" :key="'nav-item-' + index" class="nav-item">
                        <a @click="navigate(item.path)">
                            <v-icon class="nav-icon">chevron_left</v-icon>
                            <span class="nav-label">{{ item.label }}</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- List of Agencies -->
            <transition name="fade" mode="out-in" :duration="0">
                <rt-transit-agency-list v-if="!transitAgencyId"
                    id="rt-transit-agency-list"
                    :transitAgencies="transitAgencies" />
            </transition>

            <!-- List of Divisions -->
            <transition name="fade" mode="out-in" :duration="0">
                <rt-transit-division-list v-if="transitFeed || transitDivision"
                    id="rt-transit-division-list"
                    :feed="transitFeed"
                    :transitDivision="transitDivision" />
            </transition>

        </v-card>

        <!-- Events List -->
        <transition name="slide-fade" :duration="0">
            <rt-transit-event-list v-if="transitDivision"
                id="rt-transit-events"
                :transitDivision="transitDivision" />
        </transition>

    </v-container>
</template>

<script>
    const DateTime = require("right-track-core").utils.DateTime;
    const cache = require("@/utils/cache.js");
    const transit = require("@/utils/transit.js");

    const TransitAgencyList = require("@/components/alerts/TransitAgencyList.vue").default;
    const TransitDivisionList = require("@/components/alerts/TransitDivisionList.vue").default;
    const TransitEventList = require("@/components/alerts/TransitEventList.vue").default;


    /**
     * Update the Alerts display
     * - Update the route params
     * - Update the Feed
     * @param {Vue} vm Vue Instance
     */
    function _update(vm, redirect) {

        // Set the route params
        vm.agencyId = vm.$router.currentRoute.params.agency;
        vm.transitAgencyId = vm.$router.currentRoute.params.transitAgency;
        vm.transitDivisionCodes = vm.$router.currentRoute.params.transitDivision 
            ? vm.$router.currentRoute.params.transitDivision.split('/')
            : undefined;

        // Redirect to default Agency / Division
        if ( redirect && vm.agencyId && !vm.transitAgencyId ) {
            _displayAgencyDefault(vm);
        }

        // Update the Feed
        else if ( vm.transitAgencyId ) {
            _updateFeed(vm);
        }

        // Clear the Feed
        else {
            vm.transitFeed = undefined;
            vm.transitFeedUpdated = undefined;
            vm.transitDivision = undefined;
            vm.title = "Alerts";
            vm.icon = "warning";
            vm.nav = [];
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
        transit.getFeedDivision(vm.transitAgencyId, vm.transitDivisionCodes, function(err, division) {
            vm.transitDivision = division;
            _setTitle(vm);
            _setIcon(vm);
            _setNav(vm);
        });
    }


    /**
     * Set the Alerts header title
     * - use Transit Division name, if set, otherwise
     * - use Transit Agency name, if set
     * @param {Vue} vm Vue Instance
     */
    function _setTitle(vm) {
        vm.title = vm.transitDivision ? vm.transitDivision.name 
            : vm.transitAgency ? vm.transitAgency.name 
            : 'Alerts';
    }


    /**
     * Set the Alerts header icon
     * - use the Transit Division event count, if set, otherwise
     * - use the Transit Feed event count, if set
     */
    function _setIcon(vm) {
        if ( vm.transitDivision ) {
            vm.icon = vm.transitDivision.eventCount === 0 ? 'check_circle' : 'warning';
        }
        else if ( vm.transitFeed ) {
            vm.icon = vm.transitFeed.eventCount === 0 ? 'check_circle' : 'warning';
        }
        else {
            vm.icon = 'warning';
        }
    }


    function _setNav(vm) {
        let items = [];
        let base = vm.agencyId ? '/' + vm.agencyId + '/alerts' : '/alerts';
        if ( vm.transitAgency ) {
            items.push({
                path: base + '/',
                label: 'Agencies'
            });
        }
        if ( vm.transitAgency && vm.transitDivisionCodes ) {
            let path = base + '/' + vm.transitAgencyId;
            items.push({
                path: path,
                label: vm.transitAgencyId
            });
            for ( let i = 0; i < vm.transitDivisionCodes.length-1; i++ ) {
                path += '/' + vm.transitDivisionCodes[i];
                items.push({
                    path: path,
                    label: vm.transitDivisionCodes[i]
                });
            }
        }
        vm.nav = items;
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
                transitDivisionCodes: undefined,
                transitAgencies: [],
                title: 'Alerts',
                icon: 'warning',
                nav: [],
                transitAgency: undefined,
                transitDivision: undefined,
                transitFeed: undefined,
                transitFeedUpdating: false,
                transitFeedUpdated: undefined
            }
        },

        // ==== COMPUTED DATA ==== //
        computed: {
            transitEvents: function() {
                return this.transitDivision && this.transitDivision.events 
                    ? this.transitDivision.events
                    : []
            }
        },

        methods: {
            navigate: function(path) {
                console.log(path);
                this.$router.push({ path: path });
            }
        },

        // ==== ADDITIONAL COMPONENTS ==== //
        components: {
            'rt-transit-agency-list': TransitAgencyList,
            'rt-transit-division-list': TransitDivisionList,
            'rt-transit-event-list': TransitEventList
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            _update(this, true);
            _getTransitAgencies(this);
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {
            $route: function(to, from) {
                _update(this);
            },

            transitAgencyId: function() {
                _setTransitAgency(this);
                _updateFeed(this);
            },

            transitDivisionCodes: function() {
                _setTransitDivision(this);
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

    #rt-transit-events {
        max-width: 600px;
        margin: 0 auto;
    }

    .nav {
        width: 100%;
        background-color: #eee;
        padding-left: 5px;
    }
    .nav-item {
        display: inline;
    }
    .nav-icon {
        font-size: 15px;
    }
</style>