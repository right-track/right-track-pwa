<template>
    <div>
        <p class="subheading font-weight-light">Select a Transit Agency for real-time transit alerts:</p>

        <div class="agency-wrapper" v-for="agency in transitAgencies" :key="agency.id" @click="selectAgency(agency.id)">
            <div class="agency-icon">
                <img :src="agency.icon" />
            </div>
            <div class="agency-name">
                <strong>{{ agency.name }}</strong><br />
                <p class="agency-description">
                    {{ agency.description }}
                </p>
            </div>
            <div class="agency-more">
                <v-icon>chevron_right</v-icon>
            </div>
        </div>
    </div>
</template>


<script>
    
    module.exports = {

        // ==== COMPONENT PROPS ==== //
        props: {
            transitAgencies: Array
        },

        // ==== COMPONENT METHODS ==== //
        methods: {
            selectAgency(id) {
                this.$router.push({
                    name: "alerts",
                    params: {
                        agency: this.$router.currentRoute.params.agency,
                        transitAgency: id
                    }
                });
            }
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            this.$emit('setCardTitle', 'Transit Alerts');
            this.$emit('setCardIcon', 'warning');
            this.$emit('setNavItems', []);
        }

    }
</script>


<style scoped>
    .subheading {
        padding: 10px 20px;
    }

    .agency-wrapper {
        display: grid;
        grid-template-columns: 1fr 30px;
        grid-template-areas: "icon more" "name more";
        align-items: center;
        grid-gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        padding: 0 15px;
    }
    .agency-wrapper:nth-child(odd) {
        background-color: #fafafa;
    }
    .agency-wrapper:hover {
        background-color: #f5f5f5;
    }

    .agency-icon {
        grid-area: icon;
        text-align: center;
    }
    .agency-icon img {
        width: 120px;
        padding: 10px;
        margin-left: auto;
        margin-right: auto;
    }

    .agency-name {
        grid-area: name;
        padding-top: 5px;
        margin-top: auto;
        margin-bottom: auto;
        font-size: 20px;
        text-align: center;
    }
    .agency-description {
        font-size: 14px;
        line-height: 20px;
        color: #666;
    }

    .agency-more {
        grid-area: more;
        margin-top: auto;
        margin-bottom: auto;
    }

    @media (min-width: 600px) {
        .agency-wrapper {
            grid-template-columns: 120px 1fr 30px;
            grid-template-areas: "icon name more";
        }
        .agency-name {
            text-align: left;
        }
    }
</style>