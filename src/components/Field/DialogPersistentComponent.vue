<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      :max-width="tamanho"
    >
      <v-card>
        <v-card-title class="text-h5">
            {{ titulo }}
        </v-card-title>
        <v-card-text>
            <slot></slot>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="resposta(false)"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="resposta(true)"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
export default {
    name: 'DialogPersistentComponent',

    data: () => ({
        
    }),

    methods: {
        resposta(retorno) {
            this.$emit('response', { success: retorno, response: this.item, acao: this.acao})
        }
    },

    props: {
        titulo: String,
        dialog: Boolean,
        acao: String,
        tamanho: String,
        item: Object
    }
}
</script>
<style>
    
</style>