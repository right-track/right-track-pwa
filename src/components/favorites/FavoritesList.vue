<template>
    <div>
        <md-list>
            <md-list-item class="favorites-list-item" v-for="fav in favorites" :key="fav.sequence" @click="selectFavorite(fav)">

                <!-- Station -->
                <div class="favorites-list-item-container" v-if="fav.type==1">
                    <md-icon class="favorites-list-item-icon">access_time</md-icon>
                    <p class="favorites-list-item-text">{{ fav.stop.name }}</p>
                    <md-icon class="favorites-list-item-more">chevron_right</md-icon>
                </div>

                <!-- Trip -->
                <div class="favorites-list-item-container" v-if="fav.type==2">
                    <md-icon class="favorites-list-item-icon">train</md-icon>
                    <p class="favorites-list-item-text">{{ fav.origin.name }} to {{ fav.destination.name }}</p>   
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
                console.log("SELECTED FAVORITE");
                console.log(favorite);
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