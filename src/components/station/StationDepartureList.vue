<template>
    <div>
        <div v-for="departure in departures" class="wrapper" 
             v-bind:style="{'background-color': '#' + departure.trip.route.color, background: 'linear-gradient(to bottom, #' + departure.trip.route.color + 'e8, #' + departure.trip.route.color + 'ff)', color: '#' + departure.trip.route.textColor}">
            
            <!-- Medium and larger screens -->
            <div class="departure-wrapper md-small-hide-grid">
                <div class="departure-item departure-item-center">
                    {{ departure.departure.time }}
                    <span v-if="departure.status.delay > 0" class="departure-item-estimated">
                        <br />
                        <md-icon>schedule</md-icon>
                        {{ departure.status.estimatedDeparture.time }}
                    </span>
                </div>
                <div class="departure-item">
                    {{ departure.destination.name }}
                </div>
                <div class="departure-item departure-item-center">
                    {{ departure.status.status }}</span>
                </div>
                <div class="departure-item departure-item-center">
                    {{ departure.status.track }}
                </div>
            </div>
            <div v-if="departure.status.remarks" class="remarks-wrapper md-small-hide-grid">
                <div class="departure-item"></div>
                <div class="departure-item">{{ departure.status.remarks }}</div>
                <div class="departure-item"></div>
                <div class="departure-item"></div>
            </div>


            <!-- Small and smaller screens -->
            <div class="departure-wrapper-small md-small-show-grid">
                <div class="departure-item departure-item-center">
                    {{ departure.departure.time }}   
                    <span v-if="departure.status.delay > 0" class="departure-item-estimated">
                        <br />
                        <md-icon>schedule</md-icon>
                        {{ departure.status.estimatedDeparture.time }}
                    </span>                 
                </div>
                <div class="departure-item">
                    {{ departure.destination.name }}<br />
                    {{ departure.status.status }} <span v-if="departure.status.track" class="departure-item-track-small">{{ departure.status.track }}</span>
                </div>
            </div>
            <div v-if="departure.status.remarks" class="remarks-wrapper-small md-small-show-grid">
                <div class="remarks-item">{{ departure.status.remarks }}</div>
            </div>
            
        </div>
    </div>
</template>


<script>

    module.exports = {

        // ==== COMPONENT PROPS ==== //
        props: {
            departures: {
                type: Array,
                required: true
            }
        }

    }

</script>


<style scoped>
    .wrapper {
        cursor: pointer;
        border-top: 1px solid rgba(0, 0, 0, 0.40);
        opacity: 0.90;
    }
    .wrapper:hover {
        opacity: 0.99;
    }

    .departure-wrapper {
        display: grid;
        grid-template-columns: 110px auto 150px 100px;
        height: 45px;
    }
    .departure-wrapper-small {
        display: grid;
        grid-template-columns: 110px auto;
        padding: 5px 0 5px 0px;
    }
    .departure-item {
        margin: auto 0;
        padding-left: 5px;
    }
    .departure-item-center {
        text-align: center;
        padding-left: 0 !important;
    }
    .departure-item-estimated {
        font-size: 14px;
    }
    .departure-item-estimated .md-icon {
        font-size: 13px !important;
        margin-right: -5px;
        margin-top: -1px;
    }
    .departure-item-track-small {
        float: right;
        margin-right: 20px;
    }

    .remarks-wrapper {
        display: grid;
        grid-template-columns: 110px auto 150px 100px;
        margin-top: -15px;
        padding-bottom: 10px;
    }
    .remarks-wrapper-small {
        width: 100%;
        text-align: center;
        margin-top: -5px;
        padding-bottom: 10px;
    }
</style>