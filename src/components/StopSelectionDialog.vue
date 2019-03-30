<template>
    <md-dialog :md-active.sync="properties.visible">
        <md-dialog-title>
            <md-icon>place</md-icon>&nbsp;Select {{ label() }}
        </md-dialog-title>

        <md-content class="dialog-content">
            <ul class="dialog-content-list">
                <li v-for="stop in properties.stops" 
                    :class="{'disabled': properties.type === 'station' && stop.statusId === '-1'}"
                    @click="stopSelected(stop)">
                    <p>{{ stop.name }}</p>
                </li>
            </ul>
        </md-content>

        <md-dialog-actions>
            <md-button class="md-primary" @click="properties.visible=false">Close</md-button>
        </md-dialog-actions>
    </md-dialog>
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
                }
                else if ( this.properties.type === "trip" && !this.properties.origin ) {
                    console.log("Setting Origin: " + stop.name)
                    this.properties.origin = stop; 
                    this.$forceUpdate();
                }
                else if ( this.properties.type === "trip" && this.properties.origin ) {
                    this.$emit('stopSelected', this.properties.type, this.properties.origin, stop);
                }
            }
            
        }
    }
</script>


<style scoped>
    .dialog-content {
        overflow: auto;
    }
    .dialog-content-list {
        list-style-type: none;
        padding: 0;
    }
    .dialog-content-list li {
        cursor: pointer;
        padding-left: 25px;
        border-top: 1px solid #dfdfdf;
        height: 52px;
        font-size: 16px;
    }
    .dialog-content-list li.disabled {
        cursor: auto;
        text-decoration: line-through;
        color: #666;
    }
    .dialog-content-list li:hover {
        background-color: #eee !important;
    }
    .dialog-content-list li:nth-child(even) {
        background-color: #f5f5f5;
    }
</style>