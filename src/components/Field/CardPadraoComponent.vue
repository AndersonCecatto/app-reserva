<template>
    <v-card class="pb-3">
        <v-card-title>
            <slot name="titulo"></slot>
        </v-card-title>
        <v-card-text>
            <slot name="texto"></slot>
        </v-card-text>
        <v-card-actions class="px-7">
            <slot name="actions"></slot>
        </v-card-actions>
    </v-card>
</template>

<script>
export default {
    name: 'CardPadraoComponent'
}
</script>
<style>
    
</style>