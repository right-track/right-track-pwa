<template>
    <v-container class="container">

        <!-- HELP CARD -->
        <v-card>
            <v-card-title class="headline secondary-bg">
                <v-icon>help</v-icon>&nbsp;&nbsp;Help &amp; Feedback
            </v-card-title>

            <v-card-text>

                <p>Help Info Here</p>
                
                <h2>Feedback Form</h2>

                <p>If you have any feedback, such as a bug report, feature suggestion or 
                any other way to improve the site, use the form below.</p>

                <v-form model="valid" ref="form">

                    <v-text-field box
                        prepend-icon="email"
                        label="Email Address"
                        type="email"
                        v-model="email"
                        @keyup.enter="submit">
                    </v-text-field>


                </v-form>

            </v-card-text>
        </v-card>
    </v-container>
</template>


<script>
    
    module.exports = {

        data: function() {
            return {
                valid: undefined,
                email: undefined
            }
        }
    }

</script>


<style scoped>
</style>