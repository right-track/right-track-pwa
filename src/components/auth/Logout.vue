<template>
    <div class="content-container">
        <p>Logging out...</p>
    </div>
</template>


<script>
    const user = require("../../utils/user.js");

    module.exports = {

        // ==== COMPONENT DATA ==== //
        data: function() {
            return {
                src: undefined
            }
        },

        // ==== COMPONENT MOUNTED ==== //
        mounted() {
            let vm = this;
            let agencyId = vm.$route.query.agency;
            let src = vm.$route.query.src;

            // Set agency and redirect
            vm.agencyId = agencyId;
            vm.src = src;

            // Set More Menu Items and Agency Information
            vm.$emit('setMoreMenuItems', []);
            vm.$emit('setAgencyId', agencyId);

            // Perform Logout
            user.logout(function() {
                vm.$emit('showSnackbar', "Logout complete");
                vm.$router.push({path: vm.src});
            });
        }

    }
</script>