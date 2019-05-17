<template>
    <v-slide-y-transition>
        <v-alert 
            id="offline-alert"
            class="offline-alert"
            icon="cloud_off" 
            :dismissible="true"
            value="true"
            v-if="visible"
            v-resize="onResize">
            
            <span class="message">
                <strong>Offline Mode</strong>&nbsp;&nbsp;For the most recent status information, make sure you have an active internet connection.
            </span>

        </v-alert>
    </v-slide-y-transition>
</template>


<script>
    const SMALL_SCREEN_CUTOFF = 960;


    /**
     * Set the position of the Offline alert
     * - based on height of toolbar and if the 
     *   navigation drawer is always visible
     * @param {[type]} vm [description]
     */
    function _setPosition(vm) {
        if ( vm.visible ) {
            let isSmallScreen = window.innerWidth < SMALL_SCREEN_CUTOFF;
            let top = document.getElementById("app-toolbar").offsetHeight - 5;
            let paddingLeft = vm.drawerVisible && !isSmallScreen ? 275 : 25;

            let el = document.getElementById("offline-alert");
            el.style.top = top + "px";
            el.style["padding-left"] = paddingLeft + "px";
        }
    }


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

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            let vm = this;
            vm.$nextTick(function() {
                _setPosition(vm);
            });
        },

        // ==== COMPONENT METHODS ==== //
        methods: {
            onResize: function() {
                _setPosition(this);
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
        z-index: 4 !important;
    }
    .message {
        color: rgba(0, 0, 0, 0.5) !important;
    }
</style>