import Vue from 'vue'
import Router from 'vue-router'

// Page content
import About from '@/components/About'
import Register from '@/components/auth/Register'
import Login from '@/components/auth/Login'
import Logout from '@/components/auth/Logout'
import Agencies from '@/components/agencies/Agencies'
import Favorites from '@/components/favorites/Favorites'
import Trips from '@/components/trips/Trips'
import Stations from '@/components/stations/Stations'
import PageNotFound from '@/components/PageNotFound'


// Init the Router
Vue.use(Router)


// DEFINE APP ROUTES
var routes = [
    {
        path: '/',
        name: 'agencies',
        component: Agencies
    },
    {
        path: '/about',
        name: 'about',
        component: About
    },
    {
        path: '/auth/register',
        name: 'register',
        component: Register
    },
    {
        path: '/auth/login',
        name: 'login',
        component: Login
    },
    {
        path: '/auth/logout',
        name: 'logout',
        component: Logout
    },
    {
        path: '/:agency/about',
        name: 'agencyAbout',
        component: About
    },
    {
        path: '/:agency/',
        name: 'favorites',
        component: Favorites
    },
    {
        path: '/:agency/trips',
        name: 'trips',
        component: Trips
    },
    {
        path: '/:agency/stations',
        name: 'stations',
        component: Stations
    },
    {
        path: '**',
        name: 'pageNotFound',
        component: PageNotFound
    }
]


export default new Router({
    mode: 'history',
    routes: routes
})