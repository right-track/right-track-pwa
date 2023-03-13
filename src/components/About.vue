<template>
    <v-container class="container container-padded">

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
                    <strong>Installed Version: </strong>{{ site.version }} (<a :href="config.maintainer.repository + '/commits/master'">{{site.hash}}</a>)
                    <br />
                    <strong>Latest Version: </strong>{{ site.availableVersion }} (<a :href="config.maintainer.repository + '/commits/master'">{{site.availableHash}}</a>)
                    <br />
                    <strong>Source Code:</strong> <a :href="config.maintainer.repository">{{ config.maintainer.repository }}</a>
                    <br />
                    <strong>Client: </strong>{{client}}
                    <br />
                    <v-btn class="reload-button" color="primary" @click="reloadApp" title="Reload the app to ensure you have the latest version" small outline>
                        <v-icon>cloud_download</v-icon>&nbsp;&nbsp;Update App&nbsp;
                    </v-btn>
                </p>

                <br />


                <!-- API Server Info -->
                <h2>{{ server.name }}</h2>
                <p>
                    <strong>Host: </strong><a :href="'//' + server.host">{{ server.host}}</a>
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
    const store = require("@/utils/store.js");


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


    /**
     * Update Client String
     * @param  {Vue} vm Vue Instance
     */
    function _updateClient(vm) {
        store.get("client", function(err, client) {
            vm.client = client;
        });
    }


    /**
     * Set the available App version and hash
     * @param  {[type]} vm [description]
     * @return {[type]}    [description]
     */
    function _updateAppInfo(vm) {
        cache.checkAppUpdate(function(err, update, current, available, hash) {
            vm.site.availableVersion = available;
            vm.site.availableHash = hash;
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
                    hash: __VERSION_HASH__,
                    availableVersion: undefined,
                    availableHash: undefined
                },
                client: null
            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {

            /**
             * Reload the App in an attempt to update
             */
            reloadApp() {
                this.$emit('startAppUpdate');
            }

        },

        // ==== COMPONTENT MOUNTED ==== //
        mounted() {
            this.agencyId = this.$route.params.agency;
            _updateServerInfo(this);
            _updateAgencies(this);
            _updateTransitAgencies(this);
            _updateClient(this);
            _updateAppInfo(this);
        }
    }
</script>


<style scoped>
    h2 {
        border-bottom: 1px solid #eee;
        margin-bottom: 10px;
    }
    .reload-button {
        margin-left: -2px;
    }
    ul {
        margin-bottom: 10px;
    }
</style>