<template>
    <v-container class="container container-padded">
        <p>Logging out...</p>
    </v-container>
</template>


<script>
    const user = require("@/utils/user.js");

    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                agencyId: undefined,
                src: undefined
            }
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            let vm = this;
            vm.agencyId = vm.$route.query.agency;
            vm.src = vm.$route.query.src;

            // Perform Logout
            user.logout(function() {
                vm.$emit('showSnackbar', "Logout complete");
                vm.$router.push({
                    path: vm.src ? vm.src : '/'
                });
            });
        }

    }
</script>