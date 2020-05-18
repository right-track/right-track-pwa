<template>
    <v-dialog v-model.sync="properties.visible" max-width="400" v-on:keydown.enter="onKeyDownEnter" v-on:keydown="onKeyDown" persistent scrollable>
        <v-card class="card">
            <v-card-title class="headline secondary-bg">                
                <v-icon>list</v-icon>&nbsp;&nbsp;Lookup Train Number
                <v-spacer></v-spacer>
                <v-icon @click="close">close</v-icon>
            </v-card-title>
        
            <v-card-text class="card-body">
                <p>Lookup the scheduled train times in the database by train number and date:</p>
                <v-text-field v-model="trainNumber" label="Train Number" ref="trainNumber" required></v-text-field>
                <v-text-field v-model="date" label="Date" required></v-text-field>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions style="background-color: #eee">
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="trainNumberSelected">Lookup</v-btn>
            </v-card-actions>

        </v-card>
    </v-dialog>
</template>


<script>
    const DateTime = require("right-track-core").utils.DateTime;

    module.exports = {

        // ==== COMPONENT PROPERTIES ==== //
        props: {

            /**
             * Dialog Properties
             * - visible: boolean
             * @type {Object}
             */
            properties: {
                type: Object,
                required: true
            }

        },

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                trainNumber: undefined,
                date: undefined,
                focused: false
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Handle selection of train number
             */
            trainNumberSelected() {
                this.$emit('trainNumberSelected', this.trainNumber, this.date);
            },

            /**
             * Reset and close the dialog
             */
            close() {
                this.properties.visible = false;
            },

            /**
             * Handle Key Down Event
             * - switch focus to train number field
             * @param  {[type]} e [description]
             */
            onKeyDown(e) {
                if ( !this.focused ) {
                    this.$refs.trainNumber.focus();
                    this.focused = true;
                }
            },

            /**
             * Handle Enter Key Down Event
             * - select stop, if only 1 stop in filter field
             */
            onKeyDownEnter() {
                if ( this.trainNumber && this.trainNumber !== "" ) {
                    this.trainNumberSelected();
                }
            }
            
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {

            /**
             * Watch the dialog properties
             * - when visible becomes true, reset the train number
             * @type {Object}
             */
            properties: {
                handler(value) {
                    if ( value.visible ) {
                        this.trainNumber = undefined;
                        this.date = DateTime.now().getDateInt();
                        this.focused = false;
                    }
                },
                deep: true
            }

        }

    }
</script>


<style scoped>
    .card-body {
        padding: 10px;
        max-height: 600px;
    }
</style>