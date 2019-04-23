<template>
    <div>
        <div class="nav">
            <div class="nav-item">
                <a @click="transitAgencyList">
                    <v-icon class="nav-icon">chevron_left</v-icon>
                    <span class="nav-label">Transit Agencies</span>
                </a>
                <a @click="transitAgencyDivisions" v-if="transitAgency">
                    <v-icon class="nav-icon">chevron_left</v-icon>
                    <span class="nav-label">{{ transitAgency.name }}</span>
                </a>
            </div>
        </div>

        <div v-if="feed && division" class="line-list">
            <div class="line-wrapper" v-for="line in division.lines" :key="line.code" @click="selectLine(division.code)">
                <div class="line-name">
                    {{ line.name }}
                </div>
                <div class="line-badge">
                    <template v-if="line.eventCount === 0">
                        <span class="badge-good">
                            <v-icon>check_circle</v-icon>
                        </span>
                    </template>
                    <template v-else>
                        <span class="badge-bad">
                            {{ line.eventCount }}
                        </span>
                    </template>
                </div>
                <div class="line-more">
                    <v-icon>chevron_right</v-icon>
                </div>
            </div>
        </div>
    </div>
</template>


<script>

    /**
     * Handle an updated Transit Agency
     * @param  {Vue} vm Vue Instance
     */
    function _transitAgencyUpdated(vm) {
        if ( vm.transitAgency ) {
            vm.$emit('setTitle', vm.transitAgency.name);
        }
    }


    /**
     * Handle an updated Transit Feed
     * @param  {Vue} vm Vue Instance
     */
    function _transitFeedUpdated(vm) {
        if ( vm.feed ) {
            _setDivision(vm);
        }
    }


    /**
     * Set the selected Division
     * - update title and icon
     * @param {Vue} vm Vue Instance
     */
    function _setDivision(vm) {
        if ( vm.feed ) {
            for ( let i = 0; i < vm.feed.divisions.length; i++ ) {
                if ( vm.feed.divisions[i].code === vm.$router.currentRoute.params.transitDivision ) {
                    vm.division = vm.feed.divisions[i];
                }
            }
        }
        if ( vm.division ) {
            vm.$emit('setTitle', vm.division.name);
            if ( vm.division.eventCount === 0 ) {
                vm.$emit('setIcon', 'check_circle');
            }
            else {
                vm.$emit('setIcon', 'warning');
            }
        }
    }



    module.exports = {

        // ==== COMPONENT PROPS ===== //
        props: {
            transitAgency: Object,
            feed: Object,
            division: Object
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
            _transitAgencyUpdated(this);
            _transitFeedUpdated(this);
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {
            transitAgency: {
                handler: function() {
                    _transitAgencyUpdated(this);
                },
                deep: true
            },
            feed: {
                handler: function() {
                    _transitFeedUpdated(this);
                },
                deep: true
            },
            $route: function(to, from) {
                _setDivision(this);
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

    .line-wrapper {
        display: grid;
        grid-template-columns: 1fr 40px 30px;
        grid-template-areas: "name badge more";
        align-items: center;
        grid-gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
        cursor: pointer;
    }
    .line-wrapper:nth-child(even) {
        background-color: #fafafa;
    }
    .line-wrapper:hover {
        background-color: #f5f5f5;
    }

    .line-name {
        grid-area: name;
        margin-top: auto;
        margin-bottom: auto;
        font-size: 20px;
        text-align: center;
    }

    .line-badge {
        grid-area: badge;
    }

    .line-more {
        grid-area: more;
        margin-top: auto;
        margin-bottom: auto;
    }

    @media (min-width: 600px) {
        .line-wrapper {
            grid-template-columns: 1fr 40px 30px;
            grid-template-areas: "name badge more";
        }
        .line-name {
            text-align: left;
        }
    }

    .badge-good * {
        color: #57AF3F !important;
    }
    .badge-bad {
        display: inline-block;
        background-color: #ff5252;
        color: #fff;
        border-radius: 15px;
        min-width: 24px;
        height: 24px;
        text-align: center;
        padding: 2px 4px;
    }
</style>