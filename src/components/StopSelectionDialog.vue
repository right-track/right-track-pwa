<template>
    <v-dialog v-model.sync="properties.visible" max-width="400" scrollable>
        <v-card class="card">
            <v-card-title class="headline secondary-bg">                
                <v-icon>place</v-icon>&nbsp;&nbsp;Select {{ label() }}
            </v-card-title>
        
            <v-card-text class="card-body">
                <v-list>
                    <v-list-tile 
                            v-for="stop in properties.stops" 
                            :key="stop.id" 
                            class="list-item" 
                            @click="stopSelected(stop)">
                        <v-list-tile-content>
                            <v-list-tile-title :class="{'disabled': properties.type === 'station' && stop.statusId === '-1'}">
                                {{ stop.name }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="properties.visible=false" color="primary" depressed>Close</v-btn>
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
             * - type: String ("station", "trip", "origin", "destination")
             * - stops: Stop[]
             * @type {Object}
             */
            properties: {
                type: Object,
                required: true
            }

        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Generate the "Select [xxx]" label
             * @return {string} Label
             */
            label: function() {
                if ( this.properties.type === "station" ) {
                    return "Station";
                }
                else if ( this.properties.type === "origin" ) {
                    return "Origin";
                }
                else if ( this.properties.type === "destination" ) {
                    return "Destination";
                }
                else if ( this.properties.type === "trip" && !this.properties.origin ) {
                    return "Origin";
                }
                else if ( this.properties.type === "trip" && this.properties.origin ) {
                    return "Destination";
                } 
            },

            /**
             * Stop Selected
             * - emit 'stopSelected' function(type, stop, stop) to parent
             * @param  {Stop} stop Selected Stop
             */
            stopSelected(stop) {
                if ( this.properties.type === "station" && stop.statusId !== "-1" ) {
                    this.$emit('stopSelected', this.properties.type, stop);
                    this.properties.visible = false;
                }
                else if ( this.properties.type === "origin" || this.properties.type === "destination" ) {
                    this.$emit('stopSelected', this.properties.type, stop);
                    this.properties.visible = false;
                }
                else if ( this.properties.type === "trip" && !this.properties.origin ) {
                    this.properties.origin = stop; 
                    this.$forceUpdate();
                }
                else if ( this.properties.type === "trip" && this.properties.origin ) {
                    this.$emit('stopSelected', this.properties.type, this.properties.origin, stop);
                    this.properties.visible = false;
                }
            }
            
        }
    }
</script>


<style scoped>
    .card-body {
        padding: 0;
        max-height: 600px;
    }
    .list-item {
        border-bottom: 1px solid #eee;
        background-color: #fff;
    }
    .list-item:nth-child(even) {
        background-color: #fafafa;
    }
    .list-item .disabled {
        text-decoration: line-through;
        cursor: auto;
        color: #999;
    }
</style>