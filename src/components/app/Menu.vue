<template>
    <div>
        <div v-for="item in menu" :key="item.key">

            <!-- Divider -->
            <hr v-if="item.type==='divider'" class="menu-divider" />

            <!-- Menu Item / Badge -->
            <md-list v-if="item.type==='item' || item.type==='badge' || item.type==='favorite'">
                <span v-if="item.type==='badge'" class="md-list-item-badge rt-primary">4</span>
                <md-list-item @click="drawerLink(item)">
                    <md-icon class="md-list-item-icon" :class="{'rt-primary-fg': item.isActive, 'md-list-item-inactive': !item.isActive}">{{ item.icon }}</md-icon>
                    <span class="md-list-item-text" :class="{'rt-primary-fg': item.isActive, 'md-list-item-inactive': !item.isActive}">{{ item.title }}</span>
                </md-list-item>
            </md-list>

        </div>
    </div>
</template>


<script>
    const menu = require("@/utils/menu.js");

    /**
     * Get Menu Items
     * @param  {Vue} vm    Vue Instance
     * @return {Array}     List of menu items
     */
    function _getMenuItems(vm) {
        return menu(vm, vm.favorites);
    }

    module.exports = {

        // ==== COMPONENT PROPS ==== //
        props: {
            favorites: {
                type: Array,
                required: true
            }
        },
        
        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                menu: _getMenuItems(this)
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Handle a menu drawer link
             * - Close the menu
             * - Set the router to view the linked route
             * @param  {Object} item Menu Item
             */
            drawerLink(item) {
                let route = item.page;
                let params = item.params;
                let query = item.query;

                // Send message to App
                this.$emit('menuItemSelected', route);
                
                // Go to external site
                if ( route.startsWith("http") ) {
                    window.location = route;
                }

                // Go to favorites page
                else if ( item.type === "favorite" ) {
                    let favorite = item.favorite;

                    // Station
                    if ( favorite.type === 1 ) {
                        this.$router.push({
                            name: "station",
                            params: {
                                agency: this.$route.params.agency,
                                stop: favorite.stop.id
                            }
                        });
                    }

                    // Trip
                    else if ( favorite.type === 2 ) {
                        this.$router.push({
                            name: "trip",
                            params: {
                                agency: this.$route.params.agency,
                                origin: favorite.origin.id,
                                destination: favorite.destination.id
                            }
                        });
                    }
                }

                // Go to Router Path
                else if ( route.startsWith("/") ) {

                    // Set Router with properties
                    this.$router.push({
                        path: route,
                        params: params,
                        query: query
                    });

                }


                // Set Router Link
                else {

                    // Set Router with properties
                    this.$router.push({
                        name: route,
                        params: params,
                        query: query
                    });

                }

            }

        },


        // ==== COMPONENT WATCHERS ==== //
        watch: {

            /**
             * Watch for route changes
             * - Update menu items
             * @param  {Route} to To Route
             * @param  {Route} from From Route
             */
            $route: function(to, from) {
                this.menu = _getMenuItems(this)
            },

            /**
             * Watch for an update to the favorites
             */
            favorites: function(favorites) {
                this.favorites = favorites;
                this.menu = _getMenuItems(this);
            }

        }

    }
</script>


<style scoped>
    .md-list {
        padding: 0;
    }

    .md-list-item:hover {
        background-color: #eee;
    }

    .md-list-item-inactive {
        color: #777;
    }

    .md-list-item-text {
        font-weight: bold;
        word-wrap: break-word;
        white-space: normal;
    }

    .md-list-item-badge {
         position: absolute; 
         top: 14px;
         right: 15px; 
         background-color: red;
         border-radius: 25px;
         color: #fff;
         font-weight: bold;
         font-size: 14px;
         height: 20px;
         width: 20px;
         text-align: center;
         z-index: 900;
    }

    .menu-divider {
        border-top: 1px solid rgba(238, 238, 238, 0.75);
        color: rgba(238, 238, 238, 0.75);
    }
</style>