<template>
    <div>
        <div v-for="item in menu" :key="item.key">

            <!-- Divider -->
            <hr v-if="item.type=='divider'" class="menu-divider" />

            <!-- Menu Item -->
            <md-list v-if="item.type=='item'">
                <md-list-item @click="drawerLink(item)">
                    <md-icon class="md-list-item-icon" :class="{'md-list-item-icon-active': item.isActive, 'md-list-item-icon-inactive': !item.isActive}">{{ item.icon }}</md-icon>
                    <span class="md-list-item-text" :class="{'md-list-item-icon-active': item.isActive, 'md-list-item-icon-inactive': !item.isActive}">{{ item.title }}</span>
                </md-list-item>
            </md-list>

            <!-- Menu Badge -->
            <md-list v-if="item.type=='badge'">
                <span class="md-list-item-badge">4</span>
                <md-list-item @click="drawerLink(item)" :class="{'md-list-item-active': item.isActive}">
                    <md-icon class="md-list-item-icon" :class="{'md-list-item-icon-active': item.isActive, 'md-list-item-icon-inactive': !item.isActive}">{{ item.icon }}</md-icon>
                    <span class="md-list-item-text" :class="{'md-list-item-icon-active': item.isActive, 'md-list-item-icon-inactive': !item.isActive}">{{ item.title }}</span>
                </md-list-item>
            </md-list>

        </div>
    </div>
</template>


<script>
    const menu = require("../../utils/menu.js");

    module.exports = {
        
        // ==== COMPONENT DATA ==== //
        data: function() {
            return {

                // Menu Items
                menu: menu(this.$route)

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

                // Set Router Link
                else {
                    
                    // Compute query and params
                    let routerQuery = _computeProps(query, this);
                    let routerParams = _computeProps(params, this);

                    // Set Router with properties
                    this.$router.push({
                        name: route,
                        params: routerParams,
                        query: routerQuery
                    });

                }


                /**
                 * Compute the router query / params properties
                 * @param  {[type]} props Router Properties
                 * @param  {[type]} vm    Vue instance
                 */
                function _computeProps(props, vm) {
                    let routerProps = {}
                    if ( props !== undefined ) {
                        for ( let key in props ) {
                            if ( props.hasOwnProperty(key) && typeof props[key] == "function") {
                                routerProps[key] = props[key](vm);
                            }
                            else if ( query.hasOwnProperty(key) ) {
                                routerProps[key] = props[key]
                            }
                        }
                    }
                    return routerProps;
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
            $route (to, from) {
                this.menu = menu(to);
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

    .md-list-item-text, .md-list-item-icon {
        color: #777;
    }
    .md-list-item-text {
        font-weight: bold;
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