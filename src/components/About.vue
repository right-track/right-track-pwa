<template>
    <v-container class="container">

        <!-- ABOUT CARD -->
        <v-card>
            <v-card-title class="headline secondary-bg">
                <v-icon>info</v-icon>&nbsp;&nbsp;About
            </v-card-title>

            <v-card-text>

                <!-- Site Info -->
                <p class="subheading">
                    <strong>{{ config.title }}</strong> is an open-source Progressive Web App providing commuter-rail users with scheduled train times combined with real-time status information.  The 
                    software powering the website is available under the terms of its 
                    <a :href="config.maintainer.repository + '/blob/master/LICENSE'">License</a>.
                </p>

                <br />
                
                <h2>{{ config.title }}</h2>
                <p>
                    <strong>Version: </strong>{{ site.version }} (<a :href="config.maintainer.repository + '/commits/master'">{{site.hash}}</a>)
                    <br />
                    <strong>Source Code:</strong> <a :href="config.maintainer.repository">{{ config.maintainer.repository }}</a>
                </p>

                <br />


                <!-- API Server Info -->
                <h2>{{ server.name }}</h2>
                <p>
                    <strong>Host: </strong><a :href="'https://' + server.host">{{ server.host}}</a>
                    <br />
                    <strong>Version: </strong>{{ server.version}}
                    <br />
                    <strong>Source Code: </strong> <a :href="server.maintainer.source">{{ server.maintainer.source }}</a>
                </p>

                <br />


                <!-- Supported Agencies -->
                <h2>Supported Agencies</h2>
                <ul>
                    <li v-for="agency in agencies">
                        <strong>{{ agency.name }}</strong>
                        <ul>
                            <li><strong>Installed Version:</strong> {{ agency.database.installed }}</li>
                            <li><strong>Latest Version:</strong> {{ agency.database.version }}</li>
                            <li><strong>Maintainer:</strong> 
                                {{ agency.maintainer.name }} 
                                &lt;<a :href="'mailto:' + agency.maintainer.email">{{ agency.maintainer.email }}</a>&gt; 
                            </li>
                            <li><strong>Source Code:</strong> 
                                <a :href="agency.maintainer.source">{{ agency.maintainer.source }}</a>
                            </li>
                        </ul>
                    </li>
                </ul>

                <br />


                <!-- Supported Transit Agencies -->
                <h2>Supported Transit Agencies</h2>
                <ul>
                    <li v-for="agency in transitAgencies">
                        <strong>{{ agency.name }}</strong>
                        <ul>
                            <li><strong>Maintainer:</strong> 
                                {{ agency.maintainer.name }} 
                                &lt;<a :href="'mailto:' + agency.maintainer.email">{{ agency.maintainer.email }}</a>&gt; 
                            </li>
                            <li><strong>Source Code:</strong> 
                                <a :href="agency.maintainer.source">{{ agency.maintainer.source }}</a>
                            </li>
                        </ul>
                    </li>
                </ul>

                <br />

            </v-card-text>
        </v-card>
    </v-container>
</template>


<script>
    const config = require("@/utils/config.js");
    const cache = require("@/utils/cache.js");
    const db = require("@/utils/db.js");


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
                for ( let i = 0; i < agencies.length; i++ ) {
                    agencies[i].database.installed = undefined;
                }
                vm.agencies = agencies;
                for ( let i = 0; i < vm.agencies.length; i++ ) {
                    db.getDBVersion(vm.agencies[i].id, function(version) {
                        vm.agencies[i].database.installed = version;
                        console.log(JSON.stringify(vm.agencies));
                    });
                }
            }
        });
    }


    /**
     * Update the list of transit agencies
     * @param  {Vue} vm Vue Instance
     */
    function _updateTransitAgencies(vm) {
        cache.getTransitAgencies(function(err, transitAgencies) {
            if ( err ) {
                console.log(err);
                vm.transitAgencies = [];
            }
            else {
                vm.transitAgencies = transitAgencies;
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
                transitAgencies: [],
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
            _updateTransitAgencies(this);
        }
    }
</script>


<style scoped>
    ul {
        margin-bottom: 10px;
    }
</style>