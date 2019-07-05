<template>
    <v-dialog max-width="400" v-model.sync="properties.active" persistent>
        <v-card>
            <v-card-title class="headline">
                {{ properties.title }}
            </v-card-title>
            <v-card-text class="progress">
                <v-progress-circular v-if="properties.type==='spinner'" :size="60" color="primary" indeterminate></v-progress-circular>
                <v-progress-linear v-if="properties.type==='linear'" :indeterminate="!properties.progress" :value="properties.progress" color="primary"></v-progress-linear>
            </v-card-text>
            <v-card-text class="sizes" v-if="properties.loaded || properties.total">
                <span v-if="properties.loaded">{{ properties.loaded }} MB / </span> 
                <span v-if="properties.total">{{ properties.total }} MB</span>
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


<style scoped>
    .progress {
        text-align: center;
    }
    .sizes {
        text-align: right; 
        padding-top: 0
    }
</style>