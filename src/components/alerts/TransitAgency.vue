<template>
    <div>
        <div class="nav">
            <div class="nav-item">
                <a @click="transitAgencyList">
                    <v-icon class="nav-icon">chevron_left</v-icon>
                    <span class="nav-label">Transit Agencies</span>
                </a>
            </div>
        </div>

        <div v-if="feed" class="division-list">
            <div class="division-wrapper" v-for="division in feed.divisions" :key="division.code" @click="selectDivision(division.code)">
                <div class="division-icon">
                    <img :src="division.icon" />
                </div>
                <div class="division-name">
                    {{ division.name }}
                </div>
                <div class="division-badge">
                    <template v-if="division.eventCount === 0">
                        <span class="badge-good">
                            <v-icon>check_circle</v-icon>
                        </span>
                    </template>
                    <template v-else>
                        <span class="badge-bad">
                            {{ division.eventCount }}
                        </span>
                    </template>
                </div>
                <div class="division-more">
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
            if ( vm.feed.eventCount === 0 ) {
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
            feed: Object
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
             * Display the selected Transit Division
             */
            selectDivision(code) {
                this.$router.push({
                    name: "alerts",
                    params: {
                        "agency": this.$router.currentRoute.params.agency,
                        "transitAgency": this.$router.currentRoute.params.transitAgency,
                        "transitDivision": code
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

    .division-wrapper {
        display: grid;
        grid-template-columns: 1fr 40px 30px;
        grid-template-areas: "icon badge more" "name badge more";
        align-items: center;
        grid-gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
        cursor: pointer;
    }
    .division-wrapper:nth-child(even) {
        background-color: #fafafa;
    }
    .division-wrapper:hover {
        background-color: #f5f5f5;
    }

    .division-icon {
        grid-area: icon;
        text-align: center;
    }
    .division-icon img {
        width: 60px;
        padding: 10px;
        margin-left: auto;
        margin-right: auto;
    }

    .division-name {
        grid-area: name;
        margin-top: auto;
        margin-bottom: auto;
        font-size: 20px;
        text-align: center;
    }

    .division-badge {
        grid-area: badge;
    }

    .division-more {
        grid-area: more;
        margin-top: auto;
        margin-bottom: auto;
    }

    @media (min-width: 600px) {
        .division-wrapper {
            grid-template-columns: 120px 1fr 40px 30px;
            grid-template-areas: "icon name badge more";
        }
        .division-name {
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