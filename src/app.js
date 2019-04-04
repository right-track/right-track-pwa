import Vue from 'vue'
import App from '@/components/app/App.vue'
import router from '@/router'
import { MdApp, MdToolbar, MdDrawer, MdContent, MdRipple, MdIcon, MdList, 
    MdButton, MdCard, MdMenu, MdEmptyState, MdBottomBar, MdField, MdSnackbar, 
    MdDialog, MdSpeedDial, MdTooltip, MdProgress } 
    from 'vue-material/dist/components'
import 'vue-material/dist/vue-material.min.css'


// Use Material Components
Vue.use(MdApp);
Vue.use(MdToolbar);
Vue.use(MdDrawer);
Vue.use(MdContent);
Vue.use(MdRipple);
Vue.use(MdIcon);
Vue.use(MdList);
Vue.use(MdButton);
Vue.use(MdCard);
Vue.use(MdMenu);
Vue.use(MdEmptyState);
Vue.use(MdBottomBar);
Vue.use(MdField);
Vue.use(MdSnackbar);
Vue.use(MdDialog);
Vue.use(MdSpeedDial);
Vue.use(MdTooltip);
Vue.use(MdProgress);


// Start the Vue App
Vue.config.productionTip = false
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
});
