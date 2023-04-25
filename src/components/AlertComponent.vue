<template>
    <v-alert 
        :type='tipo'
        class="alert mt-3"
        dense
        border="left">
        {{ textoAlerta }}
    </v-alert>
</template>
<script>

export default {
    name: 'AlertComponent',

    data: () => ({

    }),
    props: {
        textoAlerta: String,
        tipo: String
    }
}
</script>
<style>
    .alert {
        position: fixed;
        width: auto;
        right: 3% !important;
        top: 3% !important;
        z-index: 99
    }
</style>