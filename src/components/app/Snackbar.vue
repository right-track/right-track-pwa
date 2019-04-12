<!-- 
    SNACKBAR PROPERTIES:
    visible: true/false
    duration: ms (4000)
    message: text *REQUIRED*
    dismiss: text (Dismiss)
    onDismiss: function (visible = false)
 -->

<template>
    <v-snackbar 
            v-model="properties.visible" 
            :timeout="properties.duration !== undefined ? properties.duration : 4000" 
            autoHeight
            bottom>
        
        {{ properties.message }}
        
        <v-btn @click="dismiss" color="red" flat>
            {{ properties.dismiss ? properties.dismiss : 'Dismiss' }}
        </v-btn>

    </v-snackbar>
</template>

<script>
    module.exports = {
        props: {
            properties: {
                type: Object,
                required: true
            }
        },
        methods: {
            dismiss: function() {
                if ( this.properties.onDismiss ) {
                    this.properties.onDismiss();
                }
                return this.properties.visible = false;
            }
        }
    }
</script>