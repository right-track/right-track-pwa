<template>
    <div class="right-track-info">
        <h3><strong>{{ config.title }}</strong></h3>
        <p>Part of the <strong>Right Track Library</strong>, an open source commuter rail project.</p>
        <p>
            <md-icon>code</md-icon>&nbsp;&nbsp;<a :href="config.maintainer.repository">Source Available on GitHub</a><br />
            <md-icon>email</md-icon>&nbsp;&nbsp;<a :href="'mailto:' + config.maintainer.email">{{ config.maintainer.email }}</a>
        </p>
        <p class="light">Copyright &copy; {{ year }} {{ config.maintainer.name }}</p>
    </div>
</template>


<script>
    const config = require("../../utils/config.js");
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
    .right-track-info a {
        color: #00897B;
    }
    .site-info {
        width: 100%;
        background-color: #eee;
        border-top: 1px solid #ddd;
    }
</style>