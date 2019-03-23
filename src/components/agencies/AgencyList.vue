<template>
    <div>

        <!-- SM/MD/L/XL -->
        <md-list class="md-xsmall-hide">
            <md-list-item class="agency-list-item" v-for="agency in agencies" :key="agency.id" @click="selectAgency(agency.id)">
                <div>
                    <img class="agency-list-item-icon" :src="agency.icon" />
                </div>
                <div style="width: 100%;">
                    <p class="agency-list-item-text">{{ agency.name }}</p>   
                </div>
                <div>
                    <md-icon class="agency-list-item-more">chevron_right</md-icon>
                </div>
            </md-list-item>
        </md-list>

        <!-- XS -->
        <md-list class="md-xsmall-show">
            <md-list-item class="agency-list-item" v-for="agency in agencies" :key="agency.id" @click="selectAgency(agency.id)">
                <div class="agency-list-item-container-xs">
                    <img class="agency-list-item-icon" :src="agency.icon" />
                    <p class="agency-list-item-text">{{ agency.name }}</p>   
                </div>
            </md-list-item>
        </md-list>

    </div>
</template>


<script>
    module.exports = {

        // ==== COMPONENT PROPERTIES ==== //
        props: {
            agencies: {
                type: Array,
                required: true
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Handle a selected agency
             * - Go to the agency favorites page
             * @param  {string} id Agency ID
             */
            selectAgency(id) {
                this.$router.push({name: 'favorites', params: {agency: id}});
            }

        }
        
    }
</script>


<style scoped>
    .agency-list-item {
        border-bottom: 1px solid #eee;
    }
    .agency-list-item:last-child {
        border:none;
    }
    .agency-list-item:hover {
        background-color: #E0E0E0;
    }

    .agency-list-item-icon {
        width: 80px;
        padding: 10px;
        margin-left: auto;
        margin-right: auto;
    }
    .agency-list-item-text {
        margin-left: 15px;
        font-size: 20px;
        overflow: visible;
        white-space: normal;
    }
    .agency-list-item-more {
        font-size: 20px;
    }

    .agency-list-item-container-xs {
        width: 100%;
        text-align: center;
    }
</style>