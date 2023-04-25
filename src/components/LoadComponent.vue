<template>
    <v-overlay :value="Ativo" z-index="6" opacity="0.5" class="load">
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
  .load {
    z-index: 9999 !important
  }
</style>