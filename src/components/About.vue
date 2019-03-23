<template>
    <div class="content-container">
        <md-card>
            <md-card-header>
                <h1>About</h1>
            </md-card-header>

            <md-card-content>

                <!-- Site Info -->
                <p>
                    <strong>{{ config.title }}</strong> is an open-source Progressive Web App providing commuter-rail users with scheduled train times combined with real-time status information.  The 
                    software powering the website is available under the terms of its 
                    <a :href="config.maintainer.repository + '/blob/master/LICENSE'">License</a>.
                </p>

                <br />
                
                <h2>{{ config.title }}</h2>
                <p>
                    <strong>Version: </strong>{{ site.version }} ({{site.hash}})
                    <br />
                    <a :href="config.maintainer.repository">Source Code Available</a>
                </p>

                <br />


                <!-- API Server Info -->
                <h2>{{ server.name }}</h2>
                <p>
                    <strong>Host: </strong><a :href="'https://' + server.host">{{ server.host}}</a>
                    <br />
                    <strong>Version: </strong>{{ server.version}}
                    <br />
                    <a :href="server.maintainer.source">Source Code Available</a>
                </p>

                <br />


                <!-- Supported Agencies -->
                <h2>Supported Agencies</h2>
                <ul>
                    <li v-for="agency in agencies">{{ agency.name }} ({{ agency.database.version }})</li>
                </ul>

            </md-card-content>
        </md-card>
    </div>
</template>


<script>
    const config = require("../utils/config.js");
    const cache = require("../utils/cache.js");


    /**
     * Update the API Server info used by the vue component
     * @param {Vue Instance} vm The current Vue Component Instance
     */
    function _updateServerInfo(vm) {
        cache.getServerInfo(function(err, server) {
            if ( err ) {
                console.log(err);
                vm.server = {}
            }
            else {
                vm.server = server;
            }
        });
    }

    /**
     * Update the list of agencies (and their icons) used by the vue component
     * @param  {Vue Instance} vm The current Vue Component Instance
     */
    function _updateAgencies(vm) {
        cache.getAgencies(function(err, agencies) {
            if ( err ) {
                console.log(err);
                vm.agencies = [];
            }
            else {
                vm.agencies = agencies;

                // Update the Agency Icons
                for ( i in vm.agencies ) {
                    let index = i;
                    cache.getAgencyIcon(vm.agencies[index].id, function(err, response) {
                        if ( err ) {
                            vm.agencies[index].icon = config.api.host + "/about/agencies/" + vm.agencies[index].id + "/icon";
                        }
                        else {
                            vm.agencies[index].icon = "data:image/png;base64, " + response;
                        }
                    });
                }
            }
        });
    }

    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                config: config,
                agencyId: undefined,
                agencies: [],
                server: {
                    maintainer: {}
                },
                site: {
                    version: __VERSION__,
                    hash: __VERSION_HASH__
                }
            }
        },


        // ==== COMPONTENT MOUNTED ==== //
        mounted() {
            let agency = this.$route.params.agency;
            this.agencyId = agency;

            // Set More Menu Items and Agency Information
            this.$emit('setMoreMenuItems', []);
            this.$emit('setAgencyId', agency);

            // Update Server and Agency Information
            _updateServerInfo(this);
            _updateAgencies(this);
        }
    }
</script>