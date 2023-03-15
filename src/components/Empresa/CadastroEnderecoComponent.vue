<template>
    <v-form class="px-7 mt-3">
        <v-text-field
            v-model="localLogradouro"
            label="Logradouro"
            prepend-icon="mdi-text-box-edit"
            color="green"
        />
        <v-text-field
            v-model="localBairro"
            label="Bairro"
            prepend-icon="mdi-text-box-edit"
            color="green"
        />
        <v-text-field
            v-model="localNumero"
            label="Numero"
            prepend-icon="mdi-text-box-edit"
            color="green"
        />
        <v-text-field
            v-model="localComplemento"
            label="Complemento"
            prepend-icon="mdi-text-box-edit"
            color="green"
        />
        <v-text-field
            v-model="localCep"
            label="Cep"
            prepend-icon="mdi-text-box-edit"
            color="green"
        />
        
        <auto-complete-field-component 
            Label="Estado" 
            Icon="mdi-city" 
            Url="Estado"
            :receberDados="estado"
            @retorno="retornoEstado"/>
        <auto-complete-field-component 
            v-model="cidade"
            Label="Cidade" 
            Icon="mdi-city" 
            :Url="localEstdo == null ? 'Cidade' : 'Cidade/BuscarPorIdUf/'+localEstdo"
            :receberDados="cidade" 
            @retorno="retornoCidade"/>
        <v-row class="px-3 py-7">
            <v-btn
                outlined
                large
                block
                color="green"
                @click="Salvar()"
                >
                Confirmar
            </v-btn>
        </v-row>
        <load-component :Ativo="loader"/>
    </v-form>
</template>
<script>

import AutoCompleteFieldComponent from '../Field/AutoCompleteFieldComponent.vue';
import LoadComponent from '../LoadComponent.vue'
import GenericMethods from '@/mixins/GenericMethods';
import RequestMethods from '@/mixins/RequestMethods';

export default {
    components: { LoadComponent, AutoCompleteFieldComponent },

    name: 'CadastroEnderecoComponent',
    mixins: [GenericMethods, RequestMethods],
    data: () => ({
        loader: false,
        localLogradouro: '',
        localBairro: '',
        localNumero: '',
        localComplemento: '',
        localCep: '',
        localCidadeId: '',
        localCidade: null,
        localEstdo: null,
    }),

    methods: {
        retornoEstado(retorno) {
            this.localEstdo = retorno?.id
        },

        retornoCidade(retorno) {
            this.localCidade = retorno?.id
        },

        Salvar(){
            this.loader = !this.loader;

            this.RequestPut('Endereco',
            {
                Id: this.enderecoId,
                Logradouro: this.localLogradouro,
                Bairro: this.localBairro,
                Numero: this.localNumero,
                Complemento: this.localComplemento,
                Cep: this.localCep,
                CidadeId: this.localCidade
            },
            (retorno) => this.$emit('response', { success: true, response: retorno }),
            (error) => this.$emit('response', { success: false, response: error }),
            () => (this.loader = !this.loader))
        }
    },
    created() {
        this.localLogradouro = this.logradouro
        this.localBairro = this.bairro
        this.localNumero = this.numero
        this.localComplemento = this.complemento
        this.localCep = this.cep
        this.localCidade = this.cidade
        this.localEstado = this.estado
        this.localCidadeId = this.cidadeId
    },
    props: {
        enderecoId: Number,
        logradouro: String,
        bairro: String,
        numero: String,
        complemento: String,
        cep: String,
        estado: Object,
        cidade: Object,
        cidadeId: Number
    }
}
</script>
<style>
    
</style>