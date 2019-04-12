<template>
    <v-container class="container">

        <!-- ABOUT CARD -->
        <v-card>
            <v-card-title class="secondary-bg">
                <v-icon large left>info</v-icon> 
                <h2>About</h2>
            </v-card-title>

            <v-card-text>

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

            </v-card-text>
        </v-card>
    </v-container>
</template>


<script>
    const config = require("@/utils/config.js");
    const cache = require("@/utils/cache.js");


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
            this.agencyId = this.$route.params.agency;
            _updateServerInfo(this);
            _updateAgencies(this);
        }
    }
</script>