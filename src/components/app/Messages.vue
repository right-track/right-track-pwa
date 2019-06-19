<template>
    <div>
        <template v-for="message in messages">
            <v-alert :key="message.id" :value="true" color="warning">
                <v-icon @click="dismissMessage(message.id)">cancel</v-icon>
                <h2>{{message.title}}</h2>
                <span v-html="message.body"></span>
                <v-btn v-if="message.linkTitle && message.linkUrl" :href="message.linkUrl" block>
                    {{message.linkTitle}}
                </v-btn>
            </v-alert>
            <br />
        </template>
    </div>
</template>


<script>
    const messages = require("@/utils/messages.js");


    /**
     * Display any non-dismissed Messages from the API Server
     * @param  {Vue} vm Vue Instance
     */
    function _setMessages(vm) {
        messages.getMessages(function(err, messages) {
            vm.messages = messages;
        });
    }


    /**
     * Set the specified Message as dismissed and remove 
     * it from the currently displayed Messages
     * @param  {Vue} vm Vue Instance
     * @param  {int} id Message ID
     */
    function _dismissMessage(vm, id) {
        messages.dismissMessage(id, function(err) {
            if ( !err ) {
                let rtn = [];
                for ( let i = 0; i < vm.messages.length; i++ ) {
                    if ( vm.messages[i].id !== id ) {
                        rtn.push(vm.messages[i]);
                    }
                }
                vm.messages = rtn;
            }
        });
    }


    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                messages: []
            }
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted: function() {
            _setMessages(this);
        },

        // ==== COMPONENT METHODS ==== //
        methods: {
            dismissMessage: function(id) {
                _dismissMessage(this, id);
            }
        }
    }
</script>


<style scoped>
    .v-alert {
        width: 85%;
    }
    .v-alert .v-icon {
        float: right;
    }
</style>