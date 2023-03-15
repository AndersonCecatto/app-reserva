<template>
    <v-row justify="center">
      <alert-component :texto-alerta="textoAlerta" :tipo='tipoAlerta' v-if="alerta == true"/>
      <v-dialog
        v-model="dialogNew"
        persistent
        :max-width="tamanho"
      >
        <v-card>
          <v-card-title class="text-h5">
              {{ titulo }}
          </v-card-title>
          <v-card-text>
              <slot name="text"></slot>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <slot name="actions"></slot>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </template>
<script>
import GenericMethods from '@/mixins/GenericMethods'
  
import AlertComponent from '../AlertComponent.vue'

export default {
    components: { AlertComponent },
    mixins: [GenericMethods],
    name: 'DialogPersistentWithoutBtnComponent',

    data: () => ({
        
    }),

    methods: {
        resposta() {
            this.$emit('response', { response: this.item, acao: this.acao})
        }
    },
    props: {
        titulo: String,
        dialogNew: Boolean,
        acao: String,
        tamanho: String,
        item: Object,
    }
  }
  </script>
  <style>
      
  </style>