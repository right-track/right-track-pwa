<template>
    <div>
        <h1>Stations</h1>
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

            // Set More Menu Items
            this.$emit('setMoreMenuItems', moreMenuItems);
            
        }

    }

</script>