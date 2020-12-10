<template>
    <v-dialog v-model="properties.visible" max-width="400" scrollable>
        <v-card class="card">
            <v-card-title class="headline secondary-bg">                
                <v-icon>place</v-icon>&nbsp;&nbsp;Select {{ label() }}
                <v-spacer></v-spacer>
                <v-icon @click="close">close</v-icon>
            </v-card-title>
        
            <v-card-text class="card-body">
                <v-list>
                    <v-list-tile 
                            v-for="item in items" 
                            :key="item.id" 
                            class="list-item" 
                            @click="itemSelected(item)">
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ item.name }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>


<script>
    const cache = require("@/utils/cache.js");

    /**
     * Update the list selection items
     */
    function _updateItems(vm) {
        console.log("UPDATE TRANSIT SELECTION LIST ITEMS");

        if ( !vm.agency ) {
            cache.getTransitAgencies(function(err, transitAgencies) {
                if ( err ) {
                    vm.$emit('showSnackbar', 'Could not load transit agencies. Please try again later.');
                }
                else {
                    console.log(transitAgencies);
                    vm.items = transitAgencies;
                }
            });
        }
        
    }

    module.exports = {

        // ==== COMPONENT PROPERTIES ==== //
        props: {

            /**
             * Dialog Properties
             * - visible: boolean
             * - type: String ("agency", "division", "line")
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
                items: [],
                agency: undefined,
                division: undefined
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Update the list selection items
             */
            updateItems() {
                _updateItems(this);
            },

            /**
             * Determine header label
             */
            label() {
                if ( !this.agency ) {
                    return "Transit Agency"
                }
                else if ( !this.division ) {
                    return "Transit Division"
                }
                else {
                    return "Transit Line"
                }
            },

            itemSelected(item) {
                console.log("ITEM SELECTED");
                console.log(item)
            },

            /**
             * Reset and close the dialog
             */
            close() {
                this.properties.visible = false;
            }
            
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            _updateItems(this);
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {

            agency: function(val) {
                _updateItems(this);
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