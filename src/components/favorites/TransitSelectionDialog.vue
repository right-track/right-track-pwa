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
     * Update the initial properties and list items
     * @param {Vue} vm The Vue Instance
     * @param {Function} [callback] Callback function(err)
     */
    function _update(vm, callback) {
        vm.selecting = !vm.selected.agency ? "agency" : !vm.selected.division ? "division" : "line";
        _updateItems(vm, callback);
    }

    /**
     * Update the list selection items
     * @param {Vue} vm The Vue Instance
     * @param {Function} [callback] Callback function(err)
     */
    function _updateItems(vm, callback) {
        vm.items = [{name: "Loading..."}];
        if ( vm.selecting === "agency" ) {
            cache.getTransitAgencies(function(err, transitAgencies) {
                if ( err ) {
                    vm.$emit('showSnackbar', 'Could not load transit agencies. Please try again later.');
                }
                else {
                    vm.items = transitAgencies;
                }
                if ( callback ) return callback(err);
            });
        }
        else if ( vm.selecting === "division" ) {
            transit.getFeed(vm.selected.agency.id, function(err, feed, agency) {
                if ( err ) {
                    vm.$emit('showSnackbar', 'Could not load transit agency divisions.  Please try again later.');
                }
                else {
                    vm.items = feed.divisions;
                }
                if ( callback ) return callback(err);
            });
        }
        else if ( vm.selecting === "line" ) {
            transit.getFeed(vm.selected.agency.id, function(err, feed, agency) {
                if ( err ) {
                    vm.$emit('showSnackbar', 'Could not load transit agency divisions.  Please try again later.');
                }
                else {
                    for ( let i = 0; i < feed.divisions.length; i++ ) {
                        if ( feed.divisions[i].code === vm.selected.division.code ) {
                            vm.items = feed.divisions[i].lines;
                        }
                    }
                }
                if ( callback ) return callback(err);
            });
        }
        else {
            vm.items = [];
        }
    }

    /**
     * Reset the selections
     */
    function _reset(vm) {
        vm.items = [];
        vm.selecting = undefined;
        vm.selected = {
            agency: undefined,
            division: undefined,
            line: undefined
        }
        _update(vm);
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
                selecting: undefined,
                selected: {
                    agency: undefined,
                    division: undefined,
                    line: undefined
                }
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
                return this.selecting === "agency" ? "Transit Agency" 
                    : this.selecting === "division" ? "Transit Division" 
                    : this.selecting === "line" ? "Transit Line" 
                    : "...";
            },

            /**
             * Handle a selected list item
             */
            itemSelected(item) {
                
                // Set selected item
                if ( this.selecting === "agency" ) {
                    this.selected.agency = item;
                }
                else if ( this.selecting === "division" ) {
                    this.selected.division = item;
                }
                else if ( this.selecting === "line" ) {
                    this.selected.line = item;
                }

                // Return when we've selected the desire type...
                if ( this.selecting === this.properties.type ) {
                    this.$emit('transitSelected', this.properties.type, this.selected);
                    this.close();
                }
                // Or keep selecting...
                else {
                    _update(this);
                }

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
            _update(this);
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {

            /**
             * Watch the dialog properties
             * - when visible becomes true, reset the filter stops and value
             * @type {Object}
             */
            properties: {
                handler(value) {
                    if ( !value.visible ) {
                        _reset(this);
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