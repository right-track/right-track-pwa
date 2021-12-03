<template>
    <v-list>
        <template v-for="(fav, index) in favorites">
            <v-list-tile 
                    @click="selectFavorite(fav, index)" 
                    :key="index" 
                    :style="{'background-color': removeMode && removeSelected.includes(index) ? '#ffb3b3' : index % 2 === 0 ? '#fff' : '#fafafa'}"
                    avatar>
                
                <v-list-tile-avatar>
                    <v-icon v-if="removeMode && removeSelected.includes(index)">delete</v-icon>
                    <v-icon v-else-if="reorderMode && index === 0"></v-icon>
                    <v-icon v-else-if="reorderMode" @click="reorderUp(index)">arrow_upward</v-icon>
                    <v-icon v-else>{{ fav.icon }}</v-icon>
                </v-list-tile-avatar>
                
                <v-list-tile-content>
                    <v-list-tile-title class="list-title">
                        <span class="list-title-label">
                            {{ fav.label }}
                        </span>
                        <span v-if="fav.type === FAVORITE_TYPE_TRANSIT" class="list-title-badge">
                            <template v-if="fav.eventCount === 0">
                                <span class="list-title-badge-good">
                                    <v-icon>check_circle</v-icon>
                                </span>
                            </template>
                            <template v-else-if="fav.eventCount > 0">
                                <span class="list-title-badge-bad">
                                    {{ fav.eventCount }}
                                </span>
                            </template>
                        </span>
                    </v-list-tile-title>
                </v-list-tile-content>

                <v-list-tile-action>
                    <v-icon v-if="removeMode"></v-icon>
                    <v-icon v-else-if="reorderMode && index === favorites.length-1"></v-icon>
                    <v-icon v-else-if="reorderMode" @click="reorderDown(index)">arrow_downward</v-icon>
                    <v-icon v-else>chevron_right</v-icon>
                </v-list-tile-action>

            </v-list-tile>

            <v-divider :key="'div-' + index" v-if="index !== favorites.length - 1"></v-divider>
        </template>
    </v-list>
</template>


<script>
    const Favorite = require('right-track-core').rt.Favorite;

    function _move(arr, old_index, new_index) {
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr;
    };

    module.exports = {

        // ==== COMPONENT PROPERTIES ==== //
        props: {
            favorites: {
                type: Array,
                required: true
            },
            removeMode: {
                type: Boolean,
                required: false
            },
            removeSelected: {
                type: Array,
                required: false
            },
            reorderMode: {
                type: Boolean,
                required: false
            }
        },

        computed: {
            FAVORITE_TYPE_TRANSIT: function() {
                return Favorite.FAVORITE_TYPE_TRANSIT
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Handle a selected favorite
             * @param  {Object} favorite Selected favorite
             * @param  {int}    index Selected favorite index
             */
            selectFavorite(favorite, index) {
                let vm = this;

                // REMOVE MODE
                if ( vm.removeMode ) {
                    if ( !vm.removeSelected.includes(index) ) {
                        vm.removeSelected.push(index);
                    }
                    else {
                        let i = vm.removeSelected.indexOf(index);
                        if (i !== -1) vm.removeSelected.splice(i, 1);
                    }
                    vm.$emit('updateRemoveSelected', vm.removeSelected);
                }

                // STANDARD MODE
                else if ( !vm.reorderMode ) {

                    // Station
                    if ( favorite.type === Favorite.FAVORITE_TYPE_STATION ) {
                        vm.$router.push({
                            name: "station",
                            params: {
                                agency: vm.$route.params.agency,
                                stop: favorite.stop.id
                            }
                        });
                    }

                    // Trip
                    else if ( favorite.type === Favorite.FAVORITE_TYPE_TRIP ) {
                        vm.$router.push({
                            name: "trip",
                            params: {
                                agency: vm.$route.params.agency,
                                origin: favorite.origin.id,
                                destination: favorite.destination.id
                            }
                        });
                    }

                    // Transit
                    else if ( favorite.type === Favorite.FAVORITE_TYPE_TRANSIT ) {
                        vm.$router.push({
                            path: [vm.$route.params.agency, 'alerts', favorite.agency.id, favorite.divisionCodes.join('/')].join('/')
                        });
                    }

                }
            },

            /**
             * Handle a move up request
             * @param  {int}    index Selected favorite index
             */
            reorderUp(index) {
                _move(this.favorites, index, index-1);
                this.$emit('updateFavorites', this.favorites);
            },

            /**
             * Handle a move down request
             * @param  {int}    index Selected favorite index
             */
            reorderDown(index) {
                _move(this.favorites, index, index+1);
                this.$emit('updateFavorites', this.favorites);
            }

        }
        
    }
</script>


<style scoped>
    .list-title {
        height: auto; 
        max-height: 48px; 
        line-height: 24px; 
        white-space: normal;
    }
    .list-title-badge {
        float: right;
    }
    .list-title-badge-good * {
        color: #57AF3F !important;
        font-size: 28px;
    }
    .list-title-badge-bad {
        display: inline-block;
        background-color: #ff5252;
        color: #fff;
        border-radius: 15px;
        min-width: 26px;
        height: 26px;
        text-align: center;
        padding: 2px 4px;
    }
</style>