<template>
    <v-dialog max-width="400" v-model.sync="properties.active" persistent>
        <v-card>
            <v-card-title class="headline">
                {{ properties.title }}
            </v-card-title>
            <v-card-text style="text-align: center">
                <v-progress-circular v-if="properties.type==='spinner'" :size="60" color="primary" indeterminate></v-progress-circular>
                <v-progress-linear v-if="properties.type==='linear'" :indeterminate="!properties.progress" :value="properties.progress" color="primary"></v-progress-linear>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    module.exports = {
        props: {
            properties: {
                type: Object,
                required: true
            }
        }
    }
</script>