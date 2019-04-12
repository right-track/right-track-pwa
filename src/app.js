import Vue from 'vue'
import App from '@/components/app/App.vue'
import router from '@/router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'


// Use Vuetify
Vue.use(Vuetify, {
    options: {
        customProperties: true
    }
});


// Start the Vue App
Vue.config.productionTip = false
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
});
