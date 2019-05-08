<template>
    <v-card v-if="transitLine" class="event-list">
        <div class="no-events" v-if="transitLine.eventCount === 0">
            <span class="no-events-label">Good Service</span>
            <v-icon class="no-events-icon">check_circle</v-icon>
            <br />
        </div>

        <div class="events" v-else>
            <span class="events-label">{{ transitLine.status }}</span>
            <span class="events-badge">{{ transitLine.eventCount }}</span>
            <br />
        </div>
    </v-card>
</template>


<script>

    /**
     * Handle an updated Transit Line
     * - Update Title
     * - Update Icon
     * @param  {Vue} vm Vue Instance
     */
    function _transitLineUpdated(vm) {
        if ( vm.transitLine ) {
            vm.$emit('setCardTitle', vm.transitLine.name);
            vm.$emit('setCardIcon', vm.transitLine.eventCount === 0 ? 'check_circle' : 'warning');
        }
    }


    /**
     * Set the Nav Items
     * @param {Vue} vm Vue Instance
     */
    function _setNavItems(vm) {
        if ( vm.transitAgency && vm.transitDivision ) {
            vm.$emit("setNavItems", [
                {
                    click: vm.transitAgencyList,
                    label: "Agencies"
                },
                {
                    click: vm.transitAgencyDivisions,
                    label: vm.transitAgency.name
                },
                {
                    click: vm.transitDivisionLines,
                    label: vm.transitDivision.name
                }
            ]);
        }
    }


    module.exports = {

        // ==== COMPONENT PROPS ===== //
        props: {
            transitAgency: Object,
            transitDivision: Object,
            transitLine: Object,
            feed: Object
        },

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                division: undefined
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Return to the Transit Agency List
             */
            transitAgencyList() {
                this.$router.push({
                    name: "alerts",
                    params: {
                        "agency": this.$router.currentRoute.params.agency
                    }
                });
            },

            /**
             * Return to the Transit Agency (list of divisions)
             */
            transitAgencyDivisions() {
                this.$router.push({
                    name: "alerts",
                    params: {
                        "agency": this.$router.currentRoute.params.agency,
                        "transitAgency": this.$router.currentRoute.params.transitAgency
                    }
                });
            },

            /**
             * Return to the Transit Division (list of lines)
             */
            transitDivisionLines() {
                this.$router.push({
                    name: "alerts",
                    params: {
                        "agency": this.$router.currentRoute.params.agency,
                        "transitAgency": this.$router.currentRoute.params.transitAgency,
                        "transitDivision": this.$router.currentRoute.params.transitDivision
                    }
                });
            },

            /**
             * Display the selected Transit Line
             */
            selectLine(code) {
                this.$router.push({
                    name: "alerts",
                    params: {
                        "agency": this.$router.currentRoute.params.agency,
                        "transitAgency": this.$router.currentRoute.params.transitAgency,
                        "transitDivision": this.$router.currentRoute.params.transitDivision,
                        "transitLine": code
                    }
                });
            }
            
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            _transitLineUpdated(this);
            _setNavItems(this);
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {
            transitLine: {
                handler: function() {
                    _transitLineUpdated(this);
                },
                deep: true
            },
            transitAgency: {
                handler: function() {
                    _setNavItems(this);
                },
                deep: true
            },
            transitDivision: {
                handler: function() {
                    _setNavItems(this);
                },
                deep: true
            }
        }

    }

</script>


<style scoped>
    .no-events, .events {
        padding: 10px;
    }
    
    .no-events-label, .events-label {
        color: #fff;
        padding: 2px 5px;
        border-radius: 5px;
        font-size: 18px;
        font-weight: 500;
    }
    .no-events-label {
        background-color: #57af3f;
    }
    .events-label {
        background-color: #ff5252;
    }

    .no-events-icon {
        float: right;
        color: #57af3f !important;
    }
    .events-badge {
        float: right;
        background-color: #ff5252;
        color: #fff;
        border-radius: 15px;
        min-width: 24px;
        height: 24px;
        text-align: center;
        padding: 2px 4px;
    }
</style>