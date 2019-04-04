<template>
    <div>
        <md-list>
            <md-list-item class="favorites-list-item" v-for="(fav, index) in favorites" :key="'favorite-' + index" @click="selectFavorite(fav)">
                <div class="favorites-list-item-container">
                    <md-icon class="favorites-list-item-icon">{{ fav.icon }}</md-icon>
                    <p class="favorites-list-item-text">{{ fav.label }}</p>
                    <md-icon class="favorites-list-item-more">chevron_right</md-icon>
                </div>
            </md-list-item>
        </md-list>
    </div>
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


<style scoped>
    .favorites-list-item {
        border-bottom: 1px solid #eee;
        margin: 0px -41px;
        padding: 5px 0;
    }
    .favorites-list-item:last-child {
        border:none;
    }
    .favorites-list-item:nth-child(even) {
        background-color: #f2f2f2;
    }
    .favorites-list-item:hover {
        background-color: #E0E0E0;
    }

    .favorites-list-item-container {
        width: 100%;
        display: table;
    }

    .favorites-list-item-container > * {
        display: table-cell;
        vertical-align: middle;
    }

    .favorites-list-item-icon {
        width: 50px;
        padding: 10px;
    }
    .favorites-list-item-text {
        font-size: 20px;
        overflow: visible;
        white-space: normal;
    }
    .favorites-list-item-more {
        font-size: 20px;
    }
</style>