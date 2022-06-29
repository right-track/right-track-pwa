<template>
    <v-dialog v-model.sync="properties.visible" max-width="500" scrollable>
        <v-card class="card">
            <v-card-title class="headline secondary-bg">                
                <v-icon>filter_list</v-icon>&nbsp;&nbsp;Displayed Departures
                <v-spacer></v-spacer>
                <v-icon @click="close">close</v-icon>
            </v-card-title>

            <v-card-text class="card-body">
                <div class="direction-header">
                    <p><strong>Select Direction:</strong></p>
                </div>
                <v-list>
                    <v-list-tile v-for="direction in directions" :key="direction.id" @click="selectDirection(direction)">
                        <v-list-tile-content>
                            <v-list-tile-title :class="{'selected': selectedDirection && selectedDirection.id === direction.id }">{{ direction.label }}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
                <v-layout class="terminal" row wrap>
                    <v-flex xs10>
                        <p>Include Trains that terminate at this station</p>
                    </v-flex>
                    <v-flex xs1 class="hidden-xs-only"></v-flex>
                    <v-flex xs1>
                        <v-switch class="mt-1" color="primary" v-model="includeTerminalSwitch"></v-switch>
                    </v-flex>
                </v-layout>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions style="background-color: #eee">
                <v-layout row>
                    <v-flex></v-flex>
                    <v-btn color="secondary" class="secondary-bg" @click="close">Close</v-btn>
                </v-layout>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>


<script>
    module.exports = {

        // ==== COMPONENT PROPERTIES ==== //
        props: {

            /**
             * Dialog Properties
             * - visible: boolean
             * - selected: int
             * @type {Object}
             */
            properties: {
                type: Object,
                required: true
            },

            /**
             * Directions to display as options
             */
            directions: {
              type: Array,
              required: true
            },

            /**
             * The selected Direction
             */
            selectedDirection: {
              type: Object
            },

            /**
             * Include Terminal Trains
             */
            includeTerminal: {
                type: Boolean
            }

        },

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                includeTerminalData: undefined
            };
        },

        // ==== COMPUTED DATA ==== //
        computed: {
            includeTerminalSwitch: {
                get: function() {
                    return this.includeTerminalData === undefined ? this.includeTerminal : this.includeTerminalData;
                },
                set: function(updated) {
                    this.includeTerminalData = updated;
                }
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Reset and close the dialog
             */
            close() {
                this.properties.visible = false;
            },

            /**
             * Handle the selected direction
             */
            selectDirection(direction) {
              this.$emit('directionSelected', direction);
            }
            
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {

            /**
             * Handle the toggle of the terminal flag
             */
            includeTerminal: function() {
                this.includeTerminalData = this.includeTerminal;
            },

            includeTerminalData: function() {
                this.$emit('includeTerminalToggled', this.includeTerminalData);
            }

        }


    }
</script>


<style scoped>
    .card-body {
        padding: 5px;
        max-height: 600px;
        overflow-y: scroll;
    }
    .direction-header {
        padding: 16px 16px 0 16px;
        border-bottom: 1px solid #eee;
        font-size: 16px;
    }
    .selected {
        font-weight: bold
    }
    .terminal {
        padding: 16px 16px 0 16px;
        border-top: 1px solid #eee;
    }
</style>