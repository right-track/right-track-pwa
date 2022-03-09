<template>
    <div id="map"></div>
</template>

<script>
    const cache = require("@/utils/cache.js");

    // MAP DEFAULTS //
    const ZOOM_MIN = 8;
    const ZOOM_DEFAULT = 10;
    const ZOOM_STOP = 17;
    const ZOOM_MAX = 18;
    const ZOOM_MAP_LABELS = 17;
    const ZOOM_STOP_LABELS = 13;


    /**
     * Start the setup of the map
     * - Get map data
     * - Setup the map
     * - Display basemaps
     * - Display shapes
     * - Display stops
     * @param {Vue} vm Vue Instance
     */
    function _init(vm) {
        vm.agencyId = vm.$route.params.agency;
        vm.stopID = vm.$route.query.stop;
        _updateMapData(vm, function() {
            _displayMap(vm);
            _displayBasemaps(vm);
            _displayShapes(vm);
            _displayStops(vm);
        });
    }


    /**
     * Update the map data
     * - Get agency center
     * - Get agency shapes
     * - Get agency stops
     * @param {Vue} vm Vue Instance
     * @param {Function} callback Callback function
     */
    function _updateMapData(vm, callback) {
        vm.updating = true;
        cache.getAgencyMapCenter(vm.agencyId, function(err1, center) {
            cache.getAgencyMapShapes(vm.agencyId, function(err2, shapes) {
                cache.getAgencyMapStops(vm.agencyId, function(err3, stops) {
                    vm.updating = false;
                    if ( err1 || err2 || err3 ) {
                        console.error(err1 || err2 || err3);
                        vm.$emit('showSnackbar', 'Could not load map data. Please try again later.');
                        return;
                    }
                    vm.center = center;
                    vm.shapes = shapes;
                    vm.stops = stops;
                    return callback();
                });
            });
        });
    }


    /**
     * Setup and display the base map control
     * @param {Vue} vm Vue Instance
     */
    function _displayMap(vm) {
        let center = vm.center;
        let zoom = ZOOM_DEFAULT;
        
        // Center and Zoom on passed stop
        if ( vm.stopID ) {
            for ( let i = 0; i < vm.stops.features.length; i++ ) {
                let stop = vm.stops.features[i];
                if ( vm.stopID === stop.properties.id ) {
                    center.lat = stop.properties.lat;
                    center.lon = stop.properties.lon;
                    zoom = ZOOM_STOP;
                }
            }
        }

        // Create Map
        vm.map = L.map('map', {
            minZoom: ZOOM_MIN, 
            maxZoom: ZOOM_MAX
        }).setView([center.lat, center.lon], zoom);
        vm.map.on('zoomend', function(e) {
            _onZoomEnd(vm, e);
        });
    }


    /**
     * Handle Zoom events
     * - Update the shape style
     * - Update the stop style and tooltips
     * @param {Vue} vm Vue Instance
     * @param {Object} e Zoom event
     */
    function _onZoomEnd(vm, e) {
        let zoom = vm.map.getZoom();
        vm.map.eachLayer(function(layer) {
            if ( layer.type === 'shape' ) {
                layer.setStyle(_setShapeStyle(vm, zoom, layer.feature));
            }
            else if ( layer.type === 'stop' ) {
                layer.setStyle(_setStopStyle(vm, zoom));
                let tt = layer.getTooltip();
                layer.unbindTooltip().bindTooltip(tt, _setStopTooltipStyle(vm, zoom));
            }
        });
    }


    /**
     * Display the base maps (dependent on zoom level)
     * @param {Vue} vm Vue Instance
     */
    function _displayBasemaps(vm) {
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            minZoom: ZOOM_MIN,
            maxZoom: ZOOM_MAP_LABELS-1
        }).addTo(vm.map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            minZoom: ZOOM_MAP_LABELS,
            maxZoom: ZOOM_MAX
        }).addTo(vm.map);
    }


    /**
     * Display the route Shapes
     * @param {Vue} vm Vue Instance
     */
    function _displayShapes(vm) {
        let zoom = vm.map.getZoom();
        L.geoJSON(vm.shapes, {
            onEachFeature: function(feature, layer) {
                layer.type = "shape";
                layer.setStyle(_setShapeStyle(vm, zoom, feature));
            }
        }).addTo(vm.map);
    }


    /**
     * Display the Stop markers
     * @param {Vue} vm Vue Instance
     */
    function _displayStops(vm) {
        let zoom = vm.map.getZoom();
        L.geoJSON(vm.stops, {
            pointToLayer: function(feature, latlng) {
                let layer = L.circleMarker(latlng, _setStopStyle(vm, zoom));
                layer.type = "stop";
                layer.bindTooltip(_setStopTooltipTitle(vm, feature), _setStopTooltipStyle(vm, zoom));
                layer.bindPopup(_setStopPopupContents(vm, feature), {
                    minWidth: 300,
                    maxWidth: 300
                });
                layer.on('click', function(e) {
                    _updateDepartureFeed(vm, feature.properties.id);
                });
                return layer;
            }
        }).addTo(vm.map);
    }



    // ==== COMPONENT STYLE FUNCTIONS ===== //

    /**
     * Set the style of the route Shape
     * @param {Vue} vm Vue Instance
     * @param {int} zoom Zoom level
     * @param {Object} feature Shape feature
     */
    function _setShapeStyle(vm, zoom, feature) {
        return {
            color: '#' + feature.properties.routes[0].color,
            weight: zoom < 10 ? 2 : 5,
            opacity: 0.5
        }
    }


    /**
     * Set the style of a Stop marker
     * @param {Vue} vm Vue Instance
     * @param {int} zoom Zoom level
     */
    function _setStopStyle(vm, zoom) {
        return {
            radius: zoom >= ZOOM_STOP_LABELS ? 6 : 4,
            fillColor: '#ffffff',
            color: '#000',
            weight: zoom >= ZOOM_STOP_LABELS ? 2 : 1,
            opacity: zoom < ZOOM_DEFAULT ? 0 : 1,
            fillOpacity: zoom < ZOOM_DEFAULT ? 0 : 1
        }
    }


    /**
     * Set the contents of a Stop popup
     * @param {Vue} vm Vue Instance
     * @param {Object} feature Stop feature
     */
    function _setStopPopupContents(vm, feature) {
        let rtn = `<p style='font-size: 150%; margin-bottom: 5px; border-bottom: 1px solid #666;'><strong>${feature.properties.name}</strong></p>`;
        
        // Trips
        rtn += "<br />";
        rtn += "<strong><i class='v-icon material-icons' style='font-size: 120%'>train</i>&nbsp;Trips:</strong><br />";
        rtn += `<a href='/${vm.agencyId}/trips?origin=${feature.properties.id}'>Start at ${feature.properties.name}</a><br />`;
        rtn += `<a href='/${vm.agencyId}/trips?destination=${feature.properties.id}'>End at ${feature.properties.name}</a><br />`;

        // Departures
        if ( feature.properties.hasFeed ) {
            rtn += "<br />";
            rtn += "<strong><i class='v-icon material-icons' style='font-size: 120%'>access_time</i>&nbsp;Departures:</strong><br />";
            rtn += `<div id='popup-departures-${feature.properties.id}'><br /><em>Loading...</em><br /><br /></div>`;
            rtn += `<a href='/${vm.agencyId}/stations/${feature.properties.id}'>View All Departures</a><br />`;
        }
        
        // More Information
        rtn += "<br />";
        rtn += "<strong><i class='v-icon material-icons' style='font-size: 120%'>info</i>&nbsp;More Information:</strong><br />";
        rtn += `<a href='https://www.google.com/maps/dir/?api=1&destination=${feature.properties.lat},${feature.properties.lon}'>Get Directions</a><br />`;
        if ( feature.properties.url ) rtn += `<a href='${feature.properties.url}'>Station Website</a><br />`;

        return rtn;
    }


    /**
     * Set the title of a Stop tooltip
     * @param {Vue} vm Vue Instance
     * @param {Object} feature Stop feature
     */
    function _setStopTooltipTitle(vm, feature) {
        return `<strong>${feature.properties.name}</strong>`
    }


    /**
     * Set the style of a Stop tooltip
     * @param {Vue} vm Vue Instance
     * @param {int} zoom Zoom level
     */
    function _setStopTooltipStyle(vm, zoom) {
        return {
            permanent: zoom >= ZOOM_STOP_LABELS,
            offset: L.point(0, zoom >= ZOOM_MAP_LABELS ? 20 : zoom >= ZOOM_STOP_LABELS ? 10 : 0),
            direction: 'bottom'
        }
    }



    function _updateDepartureFeed(vm, id) {
        cache.getStationFeed(vm.agencyId, id, function(err, feed) {
            let html = "<table style='width: 300px'>";
            html += "<thead><tr><th>Depature</th><th>Destination</th><th>Status</th><th>Track</th></tr><thead>";
            html += "<tbody>";
            if ( feed && feed.departures ) {
                let max = feed.departures.length < 3 ? feed.departures.length : 3;
                for ( let i = 0; i < max; i++ ) {
                    let departure = feed.departures[i];
                    html += "<tr><td>" + departure.departure.time + "</td><td>" + departure.destination.name + "</td><td>" + departure.status.status + "</td><td>" + departure.status.track.track + "</td></tr>";
                }
            }
            html += "</tbody></table>";
            document.getElementById("popup-departures-" + id).innerHTML = html;
        });
    }


    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: undefined,
                stopID: undefined,
                updating: false,
                center: {},
                shapes: undefined,
                stops: undefined,
                departures: []
            }
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            _init(this);
        },

        // ==== COMPONENT WATCHERS ==== //
        watch: {
            updating() {
                this.$emit('setProgress', this.updating);
            }
        }

  }
</script>


<style scoped>
    #map {
        margin: 0;
        padding: 0;
        height: 100%;
        z-index: 150 !important;
    }
</style>