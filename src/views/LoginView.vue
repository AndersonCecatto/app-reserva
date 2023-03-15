<template>
    <v-app>
        <v-main class="login">
            <login-component/>
        </v-main>
    </v-app>
</template>

<script>
    import LoginComponent from "../components/LoginComponent";
    export default {
        name: 'login',

        components: {
            LoginComponent
        }
    }
</script>
<style>
    
</style>