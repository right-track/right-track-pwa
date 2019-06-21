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
                    <v-icon v-else-if="reorderMode">arrow_upward</v-icon>
                    <v-icon v-else>{{ fav.icon }}</v-icon>
                </v-list-tile-avatar>
                
                <v-list-tile-content>
                    <v-list-tile-title class="list-title">
                        {{ fav.label }}
                    </v-list-tile-title>
                </v-list-tile-content>

                <v-list-tile-action>
                    <v-icon v-if="!removeMode">chevron_right</v-icon>
                </v-list-tile-action>

            </v-list-tile>

            <v-divider v-if="index !== favorites.length - 1"></v-divider>
        </template>
    </v-list>
</template>


<script>
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
                else {

                    // Station
                    if ( favorite.type === 1 ) {
                        vm.$router.push({
                            name: "station",
                            params: {
                                agency: vm.$route.params.agency,
                                stop: favorite.stop.id
                            }
                        });
                    }

                    // Trip
                    else if ( favorite.type === 2 ) {
                        vm.$router.push({
                            name: "trip",
                            params: {
                                agency: vm.$route.params.agency,
                                origin: favorite.origin.id,
                                destination: favorite.destination.id
                            }
                        });
                    }

                }
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
</style>