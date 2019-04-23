import Vue from "vue"
import Router from "vue-router"

// Page content
import About from "@/components/About.vue"
import Alerts from "@/components/alerts/Alerts.vue"
import Register from "@/components/auth/Register.vue"
import Login from "@/components/auth/Login.vue"
import Logout from "@/components/auth/Logout.vue"
import Agencies from "@/components/agencies/Agencies.vue"
import Favorites from "@/components/favorites/Favorites.vue"
import Trips from "@/components/trips/Trips.vue"
import Trip from "@/components/trip/Trip.vue"
import Stations from "@/components/stations/Stations.vue"
import Station from "@/components/station/Station.vue"
import PageNotFound from "@/components/PageNotFound.vue"


// Init the Router
Vue.use(Router)


// DEFINE APP ROUTES
var routes = [
    {
        path: "/",
        name: "agencies",
        component: Agencies
    },
    {
        path: "/about",
        name: "about",
        component: About
    },
    {
        path: "/auth/register",
        name: "register",
        component: Register
    },
    {
        path: "/auth/login",
        name: "login",
        component: Login
    },
    {
        path: "/auth/logout",
        name: "logout",
        component: Logout
    },
    {
        path: "/:agency?/alerts/:transitAgency?/:transitDivision?/:transitLine?",
        name: "alerts",
        component: Alerts
    },
    {
        path: "/:agency/about",
        name: "agencyAbout",
        component: About
    },
    {
        path: "/:agency/",
        name: "favorites",
        component: Favorites
    },
    {
        path: "/:agency/trips",
        name: "trips",
        component: Trips
    },
    {
        path: "/:agency/trips/:origin/:destination",
        name: "trip",
        component: Trip
    },
    {
        path: "/:agency/trips/:origin/:destination/:date/:time",
        name: "tripDT",
        component: Trip
    },
    {
        path: "/:agency/stations",
        name: "stations",
        component: Stations
    },
    {
        path: "/:agency/stations/:stop",
        name: "station",
        component: Station
    },
    {
        path: "**",
        name: "pageNotFound",
        component: PageNotFound
    }
]


export default new Router({
    mode: "history",
    routes: routes
});