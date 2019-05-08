<template>
    <v-card v-if="transitDivision" class="line-list">
        <div class="line-wrapper" v-for="line in transitDivision.lines" :key="line.code" @click="selectLine(line.code)">
            <div class="line-name">
                <span class="line-name-label" 
                      :style="{'background-color': line.backgroundColor, 'color': line.textColor}">
                    {{ line.name }}
                </span>
            </div>
            <div class="line-status v-small-hide" v-if="line.eventCount > 0">
                {{ line.status }}
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
    </v-card>
</template>


<script>

    /**
     * Handle an updated Transit Division
     * - Update Title
     * - Update Icon
     * @param  {Vue} vm Vue Instance
     */
    function _transitDivisionUpdated(vm) {
        if ( vm.transitDivision ) {
            vm.$emit('setCardTitle', vm.transitDivision.name);
            vm.$emit('setCardIcon', vm.transitDivision.eventCount === 0 ? 'check_circle' : 'warning');
        }
    }

    /**
     * Set the Nav Items
     * @param {Vue} vm Vue Instance
     */
    function _setNavItems(vm) {
        if ( vm.transitAgency ) {
            vm.$emit("setNavItems", [
                {
                    click: vm.transitAgencyList,
                    label: "Agencies"
                },
                {
                    click: vm.transitAgencyDivisions,
                    label: vm.transitAgency.name
                }
            ]);
        }
    }


    module.exports = {

        // ==== COMPONENT PROPS ===== //
        props: {
            transitAgency: Object,
            transitDivision: Object,
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
            let vm = this;
            _transitDivisionUpdated(vm);
            _setNavItems(vm);
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {
            transitDivision: {
                handler: function() {
                    _transitDivisionUpdated(this);
                },
                deep: true
            },
            transitAgency: {
                handler: function() {
                    _setNavItems(this);
                },
                deep: true
            }
        }

    }

</script>


<style scoped>
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
        padding-left: 25px;
    }
    .line-name-label {
        padding: 2px 7px;
        border-radius: 10px;
    }

    .line-status {
        grid-area: status;
        color: #ff5252;
        font-weight: 500;
        text-align: right;
        padding-left: 0;
        padding-right: 10px;
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
            grid-template-columns: 2fr 1fr 40px 30px;
            grid-template-areas: "name status badge more";
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