import Vue from 'vue'
import Router from 'vue-router'

// Page content
import About from '@/components/About'
import Alerts from '@/components/alerts/Alerts'
import Register from '@/components/auth/Register'
import Login from '@/components/auth/Login'
import Logout from '@/components/auth/Logout'
import Agencies from '@/components/agencies/Agencies'
import Favorites from '@/components/favorites/Favorites'
import Trips from '@/components/trips/Trips'
import Trip from '@/components/trip/Trip'
import Stations from '@/components/stations/Stations'
import Station from '@/components/station/Station'
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
        path: '/alerts',
        name: 'alerts',
        component: Alerts
    },
    {
        path: ':agency/alerts',
        name: 'agencyAlerts',
        component: Alerts
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
        path: '/:agency/trips/:origin/:destination',
        name: 'trip',
        component: Trip
    },
    {
        path: '/:agency/trips/:origin/:destination/:date/:time',
        name: 'tripDT',
        component: Trip
    },
    {
        path: '/:agency/stations',
        name: 'stations',
        component: Stations
    },
    {
        path: '/:agency/stations/:stop',
        name: 'station',
        component: Station
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