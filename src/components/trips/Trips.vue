<template>
    <div>
        <h1>Trips</h1>
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

        created() {
            let agency = this.$route.params.agency;

            // Set More Menu Items and Agency Information
            this.$emit('setMoreMenuItems', moreMenuItems);
            this.$emit('setAgencyId', agency);
            
        }

    }
    
</script>