<template>
    <v-dialog v-model="properties.visible" max-width="400" v-on:keydown.enter="onKeyDownEnter" v-on:keydown="onKeyDown" scrollable>
        <v-card class="card">
            <v-card-title class="headline secondary-bg">                
                <v-icon>place</v-icon>&nbsp;&nbsp;Select {{ label() }}
                <v-spacer></v-spacer>
                <v-icon @click="close">close</v-icon>
            </v-card-title>
        
            <v-card-text class="card-body">
                <v-list>
                    <v-list-tile 
                            v-for="stop in filterStops || properties.stops" 
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

            <v-card-actions style="background-color: #eee">
                <v-text-field ref="filter"
                    label="Filter Stops" 
                    v-model="filterValue" 
                    hide-details>
                </v-text-field>
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

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                filterValue: "",
                filterStops: undefined
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
                    this.close();
                }
                else if ( this.properties.type === "origin" || this.properties.type === "destination" ) {
                    this.$emit('stopSelected', this.properties.type, stop);
                    this.close();
                }
                else if ( this.properties.type === "trip" && !this.properties.origin ) {
                    this.properties.origin = stop; 
                    this.filterValue = "";
                    this.filterStops = undefined;
                    this.$forceUpdate();
                }
                else if ( this.properties.type === "trip" && this.properties.origin ) {
                    this.$emit('stopSelected', this.properties.type, this.properties.origin, stop);
                    this.close();
                }
            },

            /**
             * Reset and close the dialog
             */
            close() {
                this.properties.visible = false;
            },

            /**
             * Handle Key Down Event
             * - switch focus to filter field
             * @param  {[type]} e [description]
             */
            onKeyDown(e) {
                this.$refs.filter.focus();
            },

            /**
             * Handle Enter Key Down Event
             * - select stop, if only 1 stop in filter field
             */
            onKeyDownEnter() {
                if ( this.filterStops.length === 1 ) {
                    this.stopSelected(this.filterStops[0]);
                }
            }
            
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {

            /**
             * Watch filterValue
             * - update the list of filterStops that match filterValue
             * @param  {string} filter New filterValue to match
             */
            filterValue(filter) {
                let stops = [];
                for ( let i = 0; i < this.properties.stops.length; i++ ) {
                    if ( this.properties.stops[i].name.toLowerCase().indexOf(filter.toLowerCase()) !== -1 ) {
                        stops.push(this.properties.stops[i]);
                    }
                }
                this.filterStops = stops;
            },

            /**
             * Watch the dialog properties
             * - when visible becomes true, reset the filter stops and value
             * @type {Object}
             */
            properties: {
                handler(value) {
                    if ( value.visible ) {
                        this.filterStops = undefined;
                        this.filterValue = "";
                    }
                },
                deep: true
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