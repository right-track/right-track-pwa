<template>
    <v-slide-y-transition>
        <div class="prepping-database-alert" v-if="visible">
            <div class="message secondary-bg">
                <strong>Loading Database...</strong>
            </div>
        </div>
    </v-slide-y-transition>
</template>


<script>
    module.exports = {

        // ==== COMPONENT PROPS ==== //
        props: {
            visible: {
                required: true
            }
        }

    }
</script>


<style scoped>
    .prepping-database-alert {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        text-align: center;
        z-index: 200;
    }
    .message {
        display: inline-block;
        margin: 0 auto;
        padding: 5px;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
    }
</style>