<template>
    <v-list>
        <template v-for="(fav, index) in favorites">
            <v-list-tile 
                    @click="selectFavorite(fav)" 
                    :key="index" 
                    :style="{'background-color': index % 2 === 0 ? '#fff' : '#fafafa'}"
                    avatar>
                
                <v-list-tile-avatar>
                    <v-icon>{{ fav.icon }}</v-icon>
                </v-list-tile-avatar>
                
                <v-list-tile-content>
                    <v-list-tile-title>
                        {{ fav.label }}
                    </v-list-tile-title>
                </v-list-tile-content>

                <v-list-tile-action>
                    <v-icon>chevron_right</v-icon>
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
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Handle a selected favorite
             * @param  {Object} favorite Selected favorite
             */
            selectFavorite(favorite) {
                let vm = this;

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
</script>
