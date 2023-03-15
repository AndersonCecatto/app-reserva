<template>
    <v-form 
        ref="form" 
        lazy-validation
        class="px-7 mt-3">
        <v-text-field
            v-model="localLogradouro"
            label="Logradouro"
            prepend-icon="mdi-text-box-edit"
            color="green"
            :rules="required"
        />
        <v-text-field
            v-model="localBairro"
            label="Bairro"
            prepend-icon="mdi-text-box-edit"
            color="green"
            :rules="required"
        />
        <v-text-field
            v-model="localNumero"
            label="Numero"
            prepend-icon="mdi-text-box-edit"
            color="green"
            :rules="required"
        />
        <v-text-field
            v-model="localComplemento"
            label="Complemento"
            prepend-icon="mdi-text-box-edit"
            color="green"
            :rules="required"
        />
        <v-text-field
            v-model="localCep"
            label="Cep"
            prepend-icon="mdi-text-box-edit"
            color="green"
            v-mask="maskCep"
            :rules="required"
        />
        
        <auto-complete-field-component 
            Label="Estado" 
            Icon="mdi-city" 
            Url="Estado"
            :rules="required"
            :receberDados="this.retornoEndereco?.Estado"
            @retorno="retornoEstado"/>
        <auto-complete-field-component 
            Label="Cidade" 
            Icon="mdi-city" 
            :rules="required"
            :Url="localEstdo == null ? 'Cidade' : 'Cidade/BuscarPorIdUf/'+localEstdo"
            :receberDados="this.retornoEndereco?.Cidade" 
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
            if (!this.$refs.form.validate()) 
                return 

            this.loader = !this.loader;

            this.RequestPut('Endereco',
            {
                Id: this.retornoEndereco.EnderecoId,
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
        this.localLogradouro = this.retornoEndereco.Logradouro
        this.localBairro = this.retornoEndereco.Bairro
        this.localNumero = this.retornoEndereco.Numero
        this.localComplemento = this.retornoEndereco.Complemento
        this.localCep = this.retornoEndereco.Cep
        this.localCidade = this.retornoEndereco.Cidade
        this.localEstado = this.retornoEndereco.Estado
        this.localCidadeId = this.retornoEndereco.CidadeId
    },
    props: {
        retornoEndereco: Object
    }
}
</script>
<style>
    
</style>