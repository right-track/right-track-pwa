<template>
    <v-slide-y-transition>
        <v-alert 
            v-if="visible"
            icon="cloud_off" 
            value="true"
            dismissible="true"
            class="offline-alert"
            v-resize="onResize"
            :style="{'padding-left': drawerVisible && !isSmallScreen ? '275px' : '25px'}">
            
            <span class="message">
                <strong>Offline Mode</strong>&nbsp;&nbsp;For the most recent status information, make sure you have an active internet connection.
            </span>

        </v-alert>
    </v-slide-y-transition>
</template>


<script>
    const SMALL_SCREEN_CUTOFF = 960;

    module.exports = {

        // ==== COMPONENT PROPS ==== //
        props: {
            visible: {
                required: true
            },
            drawerVisible: {
                required: true
            }
        },

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                isSmallScreen: window.innerWidth < SMALL_SCREEN_CUTOFF
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {
            onResize: function() {
                this.isSmallScreen = window.innerWidth < SMALL_SCREEN_CUTOFF;
            }
        }

    }

</script>


<style scoped>
    .offline-alert {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        padding-top: 2px;
        padding-bottom: 2px;
        background-color: #b0bec5 !important;
        z-index: 1 !important;
    }
    @media screen and (min-width: 600px) and (max-width: 959px) {
        .offline-alert {
            top: 42px;
        }
    }
    @media screen and (min-width: 960px) {
        .offline-alert {
            top: 60px;
        }
    }
    .message {
        color: rgba(0, 0, 0, 0.5) !important;
    }
</style>