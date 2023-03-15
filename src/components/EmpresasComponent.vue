<template>
    <v-card class="pb-4">
        <alert-component :texto-alerta="textoAlerta" :tipo='tipoAlerta' v-if="alerta == true"/>
        <v-card-title>
            Empresas
            <v-spacer></v-spacer>
            <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Pesquisar"
                single-line
                hide-details
                @keyup="pesquisar"
            ></v-text-field>
        </v-card-title>
            <v-card class="ma-3"
                v-for="empresa in empresasView" 
                :key="empresa.id"
                @click="Acessar(empresa)">
                <v-card-text 
                    class="color-font"
                    :size="16">
                    <v-row>
                        <v-col 
                            cols="5"
                            sm="2"
                            xs="2"
                            md="2"
                            >
                            <v-avatar
                                class="profile"
                                color="grey"
                                size="100"
                            >
                                <v-img :src="empresa.imagem"></v-img>
                            </v-avatar>
                        </v-col>
                        <v-col cols="7">
                            <v-row class="py-5">
                                {{ empresa.nome }}
                                <v-spacer/>
                                <div
                                    v-if="empresa.exibirMensagemRapida"
                                    id="mensagem" 
                                    class="text-subtitle-1 font-weight-bold">
                                    {{ empresa.mensagemRapida }}
                                </div>
                            </v-row>
                            <v-row class="color-font-inside">
                                {{ empresa.endereco }}
                            </v-row>
                            <v-row class="color-font-inside">
                                {{ empresa.telefone }}
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
            <load-component :Ativo="loader"/>
    </v-card>
</template>
<script>

import AlertComponent from './AlertComponent.vue';
import LoadComponent from './LoadComponent.vue';
import GenericMethods from '@/mixins/GenericMethods';
import RequestMethods from '@/mixins/RequestMethods';

export default {
  components: { AlertComponent, LoadComponent },
    name: 'EmpresasComponent',

    mixins: [GenericMethods, RequestMethods],

    data: () => ({
        empresas: [],
        empresasView: [],
        search: '',
        imagem: null
    }),
    methods: {
        pesquisar(val) {
            this.empresasView = this.empresas.filter(element =>element.nome.toUpperCase().includes(this.search.toUpperCase()))
        },

        Acessar(empresa) {
            this.$emit('dadosEmpresa', empresa)
        },

        requestEmpresas() {
            this.loader = !this.loader;

            this.RequestGet(this.dadosUsuario.EmpresaId == '' ? 'Empresa' : 'Empresa/'+this.dadosUsuario.EmpresaId,
            (retorno) => this.RetornoEmpresas(retorno),
            (error) => this.RetornoErro(error),
            () => (this.loader = !this.loader))
        },

        RetornoEmpresas(retorno) {
            if (retorno.data.constructor === Array)
                retorno.data.forEach(element => this.preencherDadosEmpresa(element))
            else
                this.preencherDadosEmpresa(retorno.data)
        },

        preencherDadosEmpresa(element) {
            this.empresas.push({
                    id: element.id,
                    nome: element.nome,
                    endereco: element.endereco.logradouro + '/' + element.endereco.bairro,
                    telefone: element.telefone,
                    imagem: window.atob(element.imagem),

                    configuracoesEmpresaId: element.configuracoesEmpresa.id,
                    diasAtendimento: element.configuracoesEmpresa.diasAtendimento,
                    timeInicial: this.parseTimeDate(element.configuracoesEmpresa.horarioInicio),
                    timeFinal: this.parseTimeDate(element.configuracoesEmpresa.horarioFim),
                    reservaPorPeriodo: element.configuracoesEmpresa.ehPorPeriodo,
                    quantidadePessoas: element.configuracoesEmpresa.quantidadePessoas,

                    bloquearReserva: element.empresaAdicional.bloqueiaReserva,
                    exibirMensagemRapida: element.empresaAdicional.exibirMensagemRapida,
                    mensagemRapida: element.empresaAdicional.mensagemRapida
            })

            this.empresasView = this.empresas
        }
    },
    
    created() {
        this.requestEmpresas()
    },

    watch: {

        refresh (val) {
            this.empresas = []

            this.requestEmpresas()
        }

    },

    props: {
        refresh: Boolean,
        dadosUsuario: Object
    }

}
</script>
<style>
    .color-font {
        color: black !important;
        font-size: x-large;
    }

    .color-font-inside {
        font-size: large;
    }

    #mensagem {
        color: red;
    }
</style>