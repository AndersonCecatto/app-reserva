<template>
      <v-autocomplete
        v-model="model"
        :items="items"
        :loading="isLoading"
        :search-input.sync="search"
        item-text="Description"
        item-value="id"
        :label="this.Label"
        :prepend-icon="this.Icon"
        return-object
        auto-select-first
        color="green"
      ></v-autocomplete>
</template>
<script>

import RequestMethods from '@/mixins/RequestMethods'
import GenericMethods from '@/mixins/GenericMethods'

export default {
    name: "AutoCompleteFieldComponent",

    data: () => ({
        entries: [],
        isLoading: false,
        model: null,
        search: null,
    }),
    mixins: [RequestMethods, GenericMethods],
    computed: {
      fields () {
        if (!this.model) return []

        return Object.keys(this.model).map(key => {
          return {
            key,
            value: this.model[key] || 'n/a',
          }
        })
      },
      items () {
        return this.entries.map(entry => {
          const Description = entry.id + ' - ' + entry.nome
          return Object.assign({}, entry, { Description })
        })
      },
    },

    watch: {
      search (val) {
        // Items have already been loaded
        if (this.items.length > 0) return

        // Items have already been requested
        if (this.isLoading) return

        this.isLoading = true
         
        this.RequestGet(this.Url,
        (retorno) => {
          this.entries = retorno.data
        },
        (error) => this.RetornoErro(error),
        () => (this.isLoading = false))

      },
      
      model (val) {
        this.$emit('retorno', val)
        
        if (this.model == null && this.receberDados != null)
          this.entries = []
      },
    },

    created() {
        if (this.receberDados != null) {
          this.entries = [this.receberDados]
          this.model = this.receberDados
        }
    },

    props: {
      Url: String,
      Label: String,
      Icon: String,
      receberDados: Object
    }
}
</script>
<style>
    
</style>