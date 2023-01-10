import Vue from "vue"
import App from "@/components/app/App.vue"
import router from "@/router"
import Vuetify from "vuetify"
import "vuetify/dist/vuetify.min.css"
import { VuePlausible } from "vue-plausible"


// Use Vuetify
Vue.use(Vuetify, {
    options: {
        customProperties: true
    }
});


// Setup Plausible Analytics
Vue.use(VuePlausible, {
    domain: 'righttrack.io',
    apiHost: 'https://a.davidwaring.net',
    enableAutoPageviews: true,
    hashMode: true,
    trackLocalhost: false
});


// Start the Vue App
Vue.config.productionTip = false
new Vue({
    el: "#app",
    router,
    components: { App },
    template: "<App/>"
});
