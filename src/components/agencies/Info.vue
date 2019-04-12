<template>
    <div class="right-track-info">
        <h3><strong>{{ config.title }}</strong></h3>
        <p>Part of the <strong>Right Track Library</strong>, an open source commuter rail project.</p>
        <p>
            <v-icon>code</v-icon>&nbsp;&nbsp;<a :href="config.maintainer.repository">Source Available on GitHub</a><br />
            <v-icon>email</v-icon>&nbsp;&nbsp;<a :href="'mailto:' + config.maintainer.email">{{ config.maintainer.email }}</a>
        </p>
        <p class="font-weight-light">Copyright &copy; {{ year }} {{ config.maintainer.name }}</p>
    </div>
</template>


<script>
    const config = require("@/utils/config.js");
    module.exports = {
        data: function() {
            return {
                config: config,
                year: new Date().getFullYear()
            }
        }
    }
</script>


<style scoped>
    .right-track-info {
        max-width: 250px;
        margin: 45px auto 40px auto;
        text-align: center;
        color: #333;
    }
    .v-icon {
        font-size: 16px;
    }
</style>