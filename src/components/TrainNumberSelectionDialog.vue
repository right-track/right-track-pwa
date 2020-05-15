<template>
    <v-dialog v-model.sync="properties.visible" max-width="400" scrollable>
        <v-card class="card">
            <v-card-title class="headline secondary-bg">                
                <v-icon>train</v-icon>&nbsp;&nbsp;Enter Train Number
                <v-spacer></v-spacer>
                <v-icon @click="close">close</v-icon>
            </v-card-title>
        
            <v-card-text class="card-body">
                <p>Lookup the scheduled train times in the database by train number and date:</p>
                <v-text-field v-model="trainNumber" label="Train Number" required></v-text-field>
                <v-text-field v-model="date" label="Date" required></v-text-field>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions style="background-color: #eee">
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
                date: undefined
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