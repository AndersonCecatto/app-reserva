<template>
    <v-overlay :value="Ativo" z-index="6" opacity="0.5">
        <v-progress-circular
          indeterminate
          :size="70"
          :width="7"
          color="green darken-4"  
        ></v-progress-circular>
      </v-overlay>
</template>
<script>
export default {
    name: 'LoadComponent',

    props: {
        Ativo: Boolean
    },
}
</script>
<style scoped>
  
</style>