<template>
    <v-dialog max-width="400" v-model.sync="properties.active" persistent>
        <v-card>
            <v-card-title class="headline secondary-bg">
                {{ properties.title }}
            </v-card-title>
            <v-card-text v-html="properties.content"></v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="properties.onCancel" color="primary" flat>{{ properties.cancel }}</v-btn>
                <v-btn @click="properties.onConfirm" color="primary" dark>{{ properties.confirm }}</v-btn>
            </v-card-actions>
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
