<template>
    <v-slide-y-reverse-transition>
        <v-toolbar v-if="properties.visible" 
                v-resize="onResize"
                class="toolbar secondary-bg"
                :style="{'padding-left': drawerVisible && !isSmallScreen ? '250px' : '0'}"
                dense>

            <div class="toolbar-container">
                <v-slide-y-reverse-transition mode="out-in">
                    <v-toolbar-title :key="title.text" @click="selectMessage(link)">
                        <span class="title" 
                              :style="{'background-color': title.backgroundColor ? title.backgroundColor : 'transparent', 'color': title.textColor ? title.textColor + ' !important' : 'inherit', 'cursor': link ? 'pointer' : 'auto'}">
                            <v-icon v-if="title.icon" style="font-size: 18px !important">{{ title.icon }}</v-icon> {{ title.text }}
                        </span>
                        <span class="subtitle"
                              :style="{'background-color': subtitle.backgroundColor ? subtitle.backgroundColor : 'transparent', 'color': subtitle.textColor ? subtitle.textColor + ' !important' : 'inherit', 'cursor': link ? 'pointer' : 'auto'}">
                            {{ subtitle.text }}
                        </span>
                        <span v-if="badge" class="badge"
                              :style="{'cursor': link ? 'pointer' : 'auto'}">
                            {{ badge }}
                        </span>
                    </v-toolbar-title>
                </v-slide-y-reverse-transition>
            </div>

        </v-toolbar>
    </v-slide-y-reverse-transition>
</template>

<script>
    const cache = require("@/utils/cache.js");

    const SMALL_SCREEN_CUTOFF = 960;    
    const TIMER_INTERVAL = 7;
    let TIMER = undefined;


    /**
     * Start the Message Loop Timer
     * @param  {Vue} vm Vue Instance
     */
    function _startTimer(vm) {

        // Clear exisiting timer
        if ( TIMER ) {
            clearInterval(TIMER);
        }

        // Set message counts
        let index = 0;
        let max = 0;
        if ( vm.properties.transitLines ) max = max + vm.properties.transitLines.length;
        if ( vm.properties.messages ) max = max + vm.properties.messages.length;

        // Start the timer
        TIMER = setInterval(function() {
            index++;
            _updateMessage(vm, index, max);
        }, TIMER_INTERVAL * 1000);

        // Run intial message
        _updateMessage(vm, index, max);
    }

    /**
     * Update the displayed Message
     * @param  {Vue}  vm    Vue Instance
     * @param  {int}  index Message Index
     * @param  {int}  max   Message Max Count
     */
    function _updateMessage(vm, index, max) {
        index = index % max;

        // Display Message
        if ( vm.properties.messages && index < vm.properties.messages.length ) {
            let message = vm.properties.messages[index];
            vm.title = {
                text: message.title,
                icon: message.icon
            }
            vm.subtitle = {
                text: message.subtitle
            }
            vm.badge = undefined;
            vm.link = undefined;
        }

        // Display Transit Line
        else if ( vm.properties.transitLines ) {
            if ( vm.properties.messages ) index = index - vm.properties.messages.length;
            let line = vm.properties.transitLines[index];
            
            // Get matching line code
            let divisionCode = vm.transitInfo.division;
            let lineCode = undefined;
            for ( let i = 0; i < vm.transitInfo.lines.length; i++ ) {
                if ( line.toLowerCase() === vm.transitInfo.lines[i].routeShortName.toLowerCase() ) {
                    lineCode = vm.transitInfo.lines[i].lineCode;
                }
            }
            
            // Get the line status
            let lineStatus = undefined;
            for ( let i = 0; i < vm.transitFeed.divisions.length; i++ ) {
                if ( vm.transitFeed.divisions[i].code.toLowerCase() === divisionCode.toLowerCase() ) {
                    for ( let j = 0; j < vm.transitFeed.divisions[i].lines.length; j++ ) {
                        if ( vm.transitFeed.divisions[i].lines[j].code.toLowerCase() === lineCode.toLowerCase() ) {
                            lineStatus = vm.transitFeed.divisions[i].lines[j];
                        }
                    }
                }
            }
            
            // Set title, subtitle, badge and link
            vm.title = {
                text: line,
                backgroundColor: lineStatus.backgroundColor,
                textColor: lineStatus.textColor
            }
            vm.subtitle = {
                text: lineStatus.status ? lineStatus.status : "...",
                backgroundColor: lineStatus.events.length > 0 ? "#ff5252" : "#4caf50",
                textColor: "#fff"
            }
            vm.badge = lineStatus.events.length > 0 ? lineStatus.events.length : undefined;
            vm.link = lineCode ? 
                {
                    name: "alerts",
                    params: {
                        agency: vm.$router.currentRoute.params.agency,
                        transitAgency: vm.transitInfo.agency,
                        transitDivision: vm.transitInfo.division,
                        transitLine: lineCode
                    } 
                } :
                undefined;
        }
    }



    module.exports = {

        // ==== COMPONENT PROPS ==== //
        props: {
            drawerVisible: {
                required: true
            },
            properties: {
                type: Object,
                required: true
            },
            transitInfo: {
                type: Object,
                default: undefined
            },
            transitFeed: {
                type: Object,
                default: undefined
            }
        },

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                title: {
                    text: "",
                    backgroundColor: undefined,
                    textColor: undefined
                },
                subtitle: {
                    text: "",
                    backgroundColor: undefined,
                    textColor: undefined
                },
                badge: undefined,
                link: undefined,
                isSmallScreen: window.innerWidth < SMALL_SCREEN_CUTOFF
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {
            selectMessage: function(link) {
                if ( link ) {
                    this.$router.push(link);
                }
            },
            onResize: function() {
                this.isSmallScreen = window.innerWidth < SMALL_SCREEN_CUTOFF;
            }
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {
            properties: {
                handler(update) {
                    this.properties = update;
                    _startTimer(this);
                },
                deep: true
            }
        }

    }
</script>

<style scoped>
    .toolbar {
        position: fixed !important;
        bottom: 0;
        width: 100%;
        height: 36px !important;
    }

    .toolbar-container {
        width: 100%;
        max-width: 700px;
        margin: -14px auto 0 auto !important;
    }

    .title {
        font-size: 16px !important;
        font-weight: bold;
        padding: 2px 5px 2px 10px;
        border-radius: 10px;
    }
    .subtitle {
        font-size: 14px;
        font-weight: normal;
        margin-left: 10px;
        padding: 2px 7px;
        border-radius: 10px;
    }
    .badge {
        font-size: 14px;
        font-weight: normal;
        background-color: #ff5252;
        color: #fff !important;
        padding: 2px 5px;
        border-radius: 10px;
        margin-left: 10px;
    }
</style>