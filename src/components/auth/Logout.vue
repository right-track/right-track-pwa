<template>
    <div class="content-container">
        <p>Logging out...</p>
    </div>
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

            // Set More Menu Items and Agency Information
            vm.$emit('setMoreMenuItems', []);
            vm.$emit('setAgencyId', vm.agencyId);

            // Perform Logout
            user.logout(function() {
                vm.$emit('showSnackbar', "Logout complete");
                vm.$router.push({path: vm.src});
            });
        }

    }
</script>