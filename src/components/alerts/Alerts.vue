<template>
    <div>
        <h1>Transit Alerts</h1>
    </div>
</template>

<script>

    // More Menu Items
    const moreMenuItems = [
        {
            key: 1,
            type: "item",
            title: "Test 1",
            function: function() {
                console.log("Testing 1");
            }
        }
    ]

    module.exports = {

        mounted() {
            let agency = this.$route.params.agency;
            let vm = this;

            // Set More Menu Items and Agency Information
            this.$emit('setMoreMenuItems', moreMenuItems);
            this.$emit('setAgencyId', agency);
            
        }

    }

</script>