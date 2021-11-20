<template>
    <div>
        <div v-if="showStatus" class="status-wrapper">
            <div class="status-label">
                <span v-bind:class="[{'status-label-text-good': !hasEvents}, {'status-label-text-bad': hasEvents}, 'status-label-text']">
                    {{ status }}
                </span>
            </div>
            <div class="status-icon">
                <v-icon class="status-icon-check" v-if="!hasEvents">check_circle</v-icon>
                <span class="status-icon-badge badge-bad" v-else>{{ transitDivision.eventCount }}</span>
            </div>
        </div>
        <div class="division-wrapper" v-for="division in divisions" :key="division.code" @click="selectDivision(division)">
            <div class="division-icon" v-if="division.icon">
                <img :src="division.icon" />
            </div>
            <div class="division-name" 
                :style="{'background-color': division.backgroundColor, 'color': division.textColor}">
                {{ division.name }}
            </div>
            <div class="division-spacer"></div>
            <div class="division-status v-small-hide" v-if="division.status && division.eventCount > 0">
                {{ division.status }}
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
</template>


<script>
    const transit = require("@/utils/transit.js");

    module.exports = {

        // ==== COMPONENT PROPS ===== //
        props: {
            feed: Object,
            transitDivision: Object
        },

        // ==== COMPUTED DATA ==== //
        computed: {

            /**
             * Boolean flag to show status info for Division
             * - Division is set
             * - Division has no child divisions
             */
            showStatus: function() {
                return this.transitDivision && (!this.transitDivision.divisions || this.transitDivision.divisions.length === 0);
            },

            /**
             * Boolean flag for if the Division has events
             */
            hasEvents: function() {
                return this.transitDivision && this.transitDivision.events && this.transitDivision.events.length > 0;
            },

            /**
             * Get the status of the selected Division
             * - Division status, if set, otherwise
             * - 'Alert', if has events, otherwise
             * - 'No Alerts'
             */
            status: function() {
                return this.transitDivision && this.transitDivision.status ? this.transitDivision.status 
                    : this.hasEvents ? 'Alert'
                    : 'No Alerts';
            },

            /**
             * Get the list of child Divisions from the selected Division, if provided, otherwise 
             * return the list of the Feed's Divisions
             */
            divisions: function() {
                return this.transitDivision ? this.transitDivision.divisions : this.feed.divisions;
            }

        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Display the selected Transit Division
             */
            selectDivision(selected) {
                let td_params = this.$router.currentRoute.params.transitDivision;
                let td_parents = td_params ? td_params.split('/') : [];
                td_parents.push(selected.code);

                let path = this.$router.currentRoute.params.agency ? '/' + this.$router.currentRoute.params.agency : '';
                path += '/alerts/' + this.$router.currentRoute.params.transitAgency;
                path += '/' + td_parents.join('/');

                this.$router.push({path: path});
            }
            
        }

    }

</script>


<style scoped>
    .status-wrapper {
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 10px;
    }
    .status-label {
        flex-grow: 1;
    }
    .status-label-text {
        color: #fff;
        padding: 2px 5px;
        border-radius: 5px;
        font-size: 18px;
        font-weight: 500;
    }
    .status-label-text-good {
        background-color: #57af3f;
    }
    .status-label-text-bad {
        background-color: #ff5252;
    }
    .status-icon-check {
        color: #57af3f !important;
    }

    .division-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
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
        text-align: center;
    }
    .division-icon img {
        width: 60px;
        padding: 10px;
    }

    .division-name {
        font-size: 20px;
        margin-left: 15px;
        padding: 2px 7px;
        border-radius: 10px;
    }

    .division-spacer {
        flex-grow: 1;
    }

    .division-status {
        flex-grow: 2;
        color: #ff5252;
        font-weight: 500;
        text-align: right;
        margin-right: 10px;
    }

    .badge-good * {
        color: #57AF3F !important;
        font-size: 28px !important;
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