<template>
    <v-container class="page">

        <!-- HELP CARD -->
        <v-card>
            <v-card-title class="headline secondary-bg">
                <v-icon>help</v-icon>&nbsp;&nbsp;Help &amp; Feedback
            </v-card-title>

            <v-card-text class="card-content">

                <v-tabs grow icons-and-text
                    v-model="activeTab"
                    v-on:change="onTabChange"
                    height="40"
                    color="secondary-bg">
                
                    <v-tabs-slider color="primary"></v-tabs-slider>

                    <v-tab>
                        <v-icon>help</v-icon>
                    </v-tab>

                    <v-tab>
                        <v-icon>comment</v-icon>
                    </v-tab>


                    <!-- GENERAL HELP -->
                    <v-tab-item class="tab-item">
                        
                        <h3>General Help</h3>

                        <p class="question">The website display is messed up/wonky/not what I'm expecting</p>
                        <ol>
                            <li>Since this site is using modern web technologies, <strong>make sure you're using a recent version 
                                of a modern browser</strong>.  Google Chrome, Mozilla Firefox, and their variants work best.  Apple 
                                Safari should work decently.  All others haven't been thoroughly tested.</li>
                            <li>This site is a <strong>Progressive Web App (PWA)</strong> meaning that the code used to display 
                                the site is cached/stored in your browser (for offline use).  After an update to the site, your 
                                browser may still be using (portions of) old code.
                                <ul>
                                    <li>
                                        <strong>Try performing a manual refresh</strong>.  This can generally be done by holding the 
                                        shift-key while pressing the refresh button (a couple of times for good luck).
                                    </li>
                                    <li>
                                        <strong>Try clearing the site's cache/data from your browser</strong>.  The steps for this vary 
                                        depending on your browser, but there is generally a function for this by clicking the icon to the 
                                        left of the URL in the browser's location bar.
                                    </li>
                                </ul>
                            </li>
                        </ol>

                        <p class="question">A trip search is showing incorrect times</p>
                        <ol>
                            <li>
                                Make sure you have the latest agency schedule database installed
                                <ul>
                                    <li>Go to the <a @click="settings">Settings</a> page</li>
                                    <li>Click the <strong>Reset</strong> button to clear the existing schedule database and download the latest schedules</li>
                                </ul>
                            </li>
                            <li>
                                If you have the latest agency schedule database installed and the Trip Results are still displaying 
                                incorrect times, please report the error using the <a @click="feedback">Feedback Form</a>
                            </li>
                        </ol>

                    </v-tab-item>


                    <!-- FEEDBACK -->
                    <v-tab-item class="tab-item">

                        <h3>Feedback Form</h3>

                        <p>If you have any feedback, such as a bug report, feature suggestion or any other way 
                        to improve the site, you can contact the developer using the form below.</p>

                        <v-form ref="form">

                            <v-text-field box
                                prepend-icon="email"
                                label="Email Address (optional)"
                                type="email"
                                v-model="email"
                                @keyup.enter="submit">
                            </v-text-field>

                            
                            <v-select box
                                prepend-icon="list"
                                label="Feedback Type"
                                :items="feedbackTypes"
                                v-model="feedbackType">
                            </v-select>



                            <v-slide-y-transition mode="out-in">

                                <div v-if="feedbackType === 'Incorrect Trip Results'" key="trip">

                                    <p><strong>NOTE:</strong> The schedule information shown on the site comes 
                                    directly from schedule data provided by the specific agency.  Errors in the 
                                    scheduled departure/arrival times and/or missing or incorrect trips will have 
                                    to be fixed by the originating agency.  Errors in transfers can be fixed by 
                                    this site and suggestions for improving specific transfers are appreciated.</p>

                                    <v-select box
                                        prepend-icon="location_on"
                                        label="Origin"
                                        :items="stops"
                                        v-model="origin">
                                    </v-select>

                                    <v-select box
                                        prepend-icon="location_on"
                                        label="Destination"
                                        :items="stops"
                                        v-model="destination">
                                    </v-select>

                                    <v-text-field box
                                        prepend-icon="date_range"
                                        label="Date / Time"
                                        v-model="datetime">
                                    </v-text-field>

                                    <v-textarea box auto-grow
                                        prepend-icon="message"
                                        label="Description"
                                        hint="Please describe what was (incorrectly) displayed on the site and what you thought should have been displayed."
                                        v-model="tripDescription">
                                    </v-textarea>

                                </div>

                                <div v-if="feedbackType === 'General Bug Report'" key="bug">

                                    <v-textarea box auto-grow
                                        prepend-icon="message"
                                        label="Bug Description"
                                        hint="Please describe the bug as detailed as you can (ie steps to produce the problem) and what you thought should have happened."
                                        v-model="bugDescription">
                                    </v-textarea>

                                </div>

                                <div v-if="feedbackType === 'Feature Suggestion'" key="feature">

                                    <v-textarea box auto-grow
                                        prepend-icon="message"
                                        label="Feature Suggestion"
                                        hint="Please describe the feature suggestion."
                                        v-model="featureDescription">
                                    </v-textarea>

                                </div>


                                <div v-if="feedbackType === 'Other'" key="other">

                                    <v-textarea box auto-grow
                                        prepend-icon="message"
                                        label="Other Feedback"
                                        v-model="otherDescription">
                                    </v-textarea>

                                </div>

                            </v-slide-y-transition>

                            <v-btn color="primary" :disabled="!valid" block
                                @keyup.enter="submit"
                                @click="submit">
                                    Submit
                            </v-btn>

                        </v-form>

                    </v-tab-item>

                </v-tabs>

            </v-card-text>
        </v-card>
    </v-container>
</template>


<script>
    const core = require("right-track-core");
    const api = require("@/utils/api.js");
    const DB = require("@/utils/db.js");
    const store = require("@/utils/store.js");
    const StopSelectionDialog = require("@/components/StopSelectionDialog.vue").default;

    const TAB_NAMES = ["help", "feedback"];

    /**
     * Get the Stops from the Agency DB
     * @param  {Vue}      vm       Vue Instance
     * @param  {Function} callback Callback function(stops)
     */
    function _getStops(vm, callback) {
        let agencyID = vm.$route.params.agency;
        let db = DB.getDB(agencyID, function(err, db) {
            if ( err ) {
                console.error(err);
                return callback([]);
            }
            core.query.stops.getStops(db, function(err, stops) {
                if ( err ) {
                    console.error(err);
                    return callback([]);
                }
                return callback(stops);
            });
        });
    }


    /**
     * Validate the Feedback Form
     * - Set vm.valid to true if form can be submitted
     * @param  {Vue} vm Vue Instance
     */
    function _validate(vm) {
        let type = vm.feedbackType;
        if ( type === "Incorrect Trip Results" ) {
            vm.valid = vm.origin && vm.destination && vm.datetime;
        }
        else if ( type === "General Bug Report" ) {
            vm.valid = vm.bugDescription && vm.bugDescription !== "";
        }
        else if ( type === "Feature Suggestion" ) {
            vm.valid = vm.featureDescription && vm.featureDescription !== "";
        }
        else if ( type === "Other" ) {
            vm.valid = vm.otherDescription && vm.otherDescription !== "";
        }
        else {
            vm.valid = false;
        }
    }


    /**
     * Build the Feedback and Send to the API
     * @param {Vue}      vm         Vue Instance
     * @param {function} [callback] Callback function(err)
     */
    function _sendFeedback(vm, callback) {
        let agency = vm.$router.currentRoute.params.agency;
        let replyTo = vm.email;
        let subject = vm.feedbackType;
        let to = vm.feedbackType === "Incorrect Trip Results" ? "agency" : "client";
        
        // Build Email Body
        let body = "<h3>" + vm.feedbackType + "</h3>";
        body += "<p><strong>Reply To:</strong> " + replyTo + "</p>";

        if ( vm.feedbackType === "Incorrect Trip Results" ) {
            body += "<p><strong>Origin:</strong> " + vm.origin + "<br />";
            body += "<strong>Destination:</strong> " + vm.destination + "<br />";
            body += "<strong>Date/Time:</strong> " + vm.datetime + "<br />";
            body += "<strong>Description:</strong> " + vm.tripDescription + "</p>";
        }
        else if ( vm.feedbackType === "General Bug Report" ) {
            body += "<p><strong>Description:</strong><br />" + vm.bugDescription + "</p>";
        }
        else if ( vm.feedbackType === "Feature Suggestion" ) {
            body += "<p><strong>Description:</strong><br />" + vm.featureDescription + "</p>";
        }
        else if ( vm.feedbackType === "Other" ) {
            body += "<p><strong>Description:</strong><br />" + vm.otherDescription + "</p>";
        }

        // Get Database Version
        DB.getDBVersion(agency, function(version) {
            store.get("client", function(err, client) {

                // Set Metadata
                let metadata = {
                    agency: agency,
                    database: version,
                    site: {
                        version: vm.site.version,
                        hash: vm.site.hash,
                        host: window.location.hostname
                    },
                    app_client: client,
                    ua: navigator.userAgent
                }

                // Send the Feedback
                api.post("/feedback", {
                    to: to,
                    replyTo: replyTo,
                    subject: subject,
                    body: body,
                    metadata: metadata
                }, function(err) {
                    return callback(err);
                });

            });
        });

    }


    
    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: undefined,
                activeTab: 0,

                // Form Data
                valid: undefined,
                email: undefined,
                feedbackTypes: ["Incorrect Trip Results", "General Bug Report", "Feature Suggestion", "Other"],
                feedbackType: undefined,
                stops: [],
                origin: undefined,
                destination: undefined,
                datetime: undefined,
                tripDescription: undefined,
                bugDescription: undefined,
                featureDescription: undefined,
                otherDescription: undefined,

                // Site Information
                site: {
                    version: __VERSION__,
                    hash: __VERSION_HASH__
                }

            }
        },

        // ==== COMPONENT METHODS ==== //
        methods: {
            onTabChange() {
                this.$router.replace({
                    path: this.agencyId ? "/" + this.agencyId + "/help" : "/help",
                    query: {
                        tab: TAB_NAMES[this.activeTab]
                    }
                });
            },
            settings: function() {
                this.$router.push({
                    path: this.agencyId ? "/" + this.agencyId + "/settings": "/settings",
                    query: {
                        tab: "updates"
                    }
                });
            },
            feedback: function() {
                for ( let i = 0; i < TAB_NAMES.length; i++ ) {
                    if ( TAB_NAMES[i] === "feedback" ) {
                        this.activeTab = i;
                        this.feedbackType = "Incorrect Trip Results";
                        this.onTabChange();
                    }
                }
            },
            submit: function() {
                let vm = this;
                vm.valid = false;
                _sendFeedback(vm, function(err) {
                    vm.valid = true;
                    if ( err ) {
                        console.log(err);
                        vm.$emit('showSnackbar', 'Could not submit feedback.  Please try again later.');
                    }
                    else {
                        vm.feedbackType = undefined;
                        vm.origin = undefined;
                        vm.destination = undefined;
                        vm.datetime = undefined;
                        vm.tripDescription = undefined;
                        vm.bugDescription = undefined;
                        vm.featureDescription = undefined;
                        vm.otherDescription = undefined;
                        vm.$emit('showSnackbar', 'Feedback submitted.  Thank you!');   
                    }
                });
            },
            watch: function(props, watcher) {
                let vm = this;
                let iterator = function(prop) {
                    vm.$watch(prop, function() {
                        _validate(vm);
                    });
                }
                props.forEach(iterator, vm);
            }
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            let vm = this;
            vm.agencyId = vm.$route.params.agency;

            // Set Active Tab
            let tab = vm.$route.query.tab;
            for ( let i = 0; i < TAB_NAMES.length; i++ ) {
                if ( TAB_NAMES[i] === tab ) {
                    vm.activeTab = i;
                }
            }

            // Set Feedback Type, if provided
            let type = vm.$route.query.type;
            if ( type ) {
                vm.feedbackType = type;
            }

            // Set List of Stop Names
            _getStops(vm, function(stops) {
                vm.stops = [];
                for ( let i = 0; i < stops.length; i++ ) {
                    vm.stops[i] = stops[i].name;
                }
            });

            // Set Watchers
            vm.watch([
                'feedbackType', 
                'origin', 
                'destination', 
                'datetime', 
                'tripDescription', 
                'bugDescription', 
                'featureDescription', 
                'otherDescription'
            ], _validate.bind(vm));

        }

    }

</script>


<style scoped>
    .card-content {
        padding: 0 0 16px 0;
    }

    .tab-item {
        padding: 16px;
    }
    .tab-item h3 {
        border-bottom: 1px solid #999;
    }
    .tab-item p {
        margin: 10px 5px;
    }

    p.question {
        font-weight: 700;
        font-size: 16px;
        margin: 15px 0 5px 0;
    }
    ol > li {
        margin-top: 10px;
    }
</style>