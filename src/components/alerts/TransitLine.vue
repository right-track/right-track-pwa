<template>
    <div>
        <div class="nav">
            <div class="nav-item">
                <a @click="transitAgencyList">
                    <v-icon class="nav-icon">chevron_left</v-icon>
                    <span class="nav-label">Agencies</span>
                </a>
                <a @click="transitAgencyDivisions" v-if="transitAgency">
                    <v-icon class="nav-icon">chevron_left</v-icon>
                    <span class="nav-label">{{ transitAgency.name }}</span>
                </a>
                <a @click="transitDivisionLines" v-if="transitDivision">
                    <v-icon class="nav-icon">chevron_left</v-icon>
                    <span class="nav-label">{{ transitDivision.name }}</span>
                </a>
            </div>
        </div>

        <div v-if="transitLine" class="event-list">
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
        </div>
    </div>
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
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {
            transitLine: {
                handler: function() {
                    _transitLineUpdated(this);
                },
                deep: true
            }
        }

    }

</script>


<style scoped>
    .nav {
        width: 100%;
        background-color: #eee;
        padding-left: 5px;
        margin-bottom: 10px;
        border-bottom: 1px solid #ccc;
    }
    .nav-icon {
        font-size: 15px;
    }

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