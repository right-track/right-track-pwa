<template>
    <div>
        <div class="agency-wrapper" v-for="agency in agencies" :key="agency.id" @click="selectAgency(agency.id)">
            <div class="agency-icon">
                <img :src="agency.icon" />
            </div>
            <div class="agency-name">
                {{ agency.name }}
            </div>
            <div class="agency-more">
                <md-icon>chevron_right</md-icon>
            </div>
        </div>
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
    .agency-wrapper {
        display: grid;
        grid-template-columns: 1fr 30px;
        grid-template-areas: "icon more" "name more";
        grid-gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
        cursor: pointer;
    }
    .agency-wrapper:nth-child(even) {
        background-color: 1px solid #eee;
    }
    .agency-wrapper:last-child {
        border: none;
    }
    .agency-wrapper:hover {
        background-color: #E0E0E0;
    }

    .agency-icon {
        grid-area: icon;
        text-align: center;
    }
    .agency-icon img {
        width: 60px;
        padding: 10px;
        margin-left: auto;
        margin-right: auto;
    }

    .agency-name {
        grid-area: name;
        margin-top: auto;
        margin-bottom: auto;
        font-size: 20px;
        text-align: center;
    }

    .agency-more {
        grid-area: more;
        margin-top: auto;
        margin-bottom: auto;
    }

    @media (min-width: 600px) {
        .agency-wrapper {
            grid-template-columns: 80px 1fr 30px;
            grid-template-areas: "icon name more";
        }
        .agency-name {
            text-align: left;
        }
    }
</style>