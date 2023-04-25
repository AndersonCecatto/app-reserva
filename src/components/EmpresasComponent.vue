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
                :disabled="empresa.bloquearReserva"
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
                                <v-rating
                                    v-model="empresa.nota"
                                    color="yellow darken-3"
                                    background-color="grey darken-1"
                                    empty-icon="$ratingFull"
                                    half-increments
                                    readonly
                                    hover
                                    small
                                />
                                <span class="text-caption">{{ empresa.quantidadeAvaliacoes }} Avaliações</span>
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
        imagem: null,
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

            this.RequestGet(this.dadosUsuario.EmpresaId == '' ? 'Empresa' : 'Empresa/'+this.dadosUsuario.EmpresaId+'/BuscarAvaliacoes/true',
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
            let nota = 0
            let labelEndereco = element.endereco.logradouro +', '
                                + element.endereco.numero + ' - '
                                + element.endereco.bairro + ', '
                                + element.endereco.cidade.nome

            if (element.avaliacaos?.length > 0)
                nota = element.avaliacaos.map(x => x.nota).reduce((a, b) => a + b) / element.avaliacaos.length

            this.empresas.push({
                id: element.id,
                nome: element.nome,
                endereco: labelEndereco,
                telefone: element.telefone,
                imagem: window.atob(element.imagem),

                configuracoesEmpresaId: element.configuracoesEmpresa.id,
                diasAtendimento: element.configuracoesEmpresa.diasAtendimento,
                timeInicial: this.parseTimeDate(element.configuracoesEmpresa.horarioInicio),
                timeFinal: this.parseTimeDate(element.configuracoesEmpresa.horarioFim),
                reservaPorPeriodo: element.configuracoesEmpresa.ehPorPeriodo,
                utilizarServico: element.configuracoesEmpresa.utilizaServico,
                quantidadePessoas: element.configuracoesEmpresa.quantidadePessoas,

                bloquearReserva: element.empresaAdicional.bloqueiaReserva,
                exibirMensagemRapida: element.empresaAdicional.exibirMensagemRapida,
                mensagemRapida: element.empresaAdicional.mensagemRapida,
                aceitaReservaAutomativamente: element.empresaAdicional.aceitaReservaAutomaticamente,
                nota: nota,
                quantidadeAvaliacoes: element.avaliacaos.length
            })  

            this.empresasView = this.empresas
        },

        requestBuscarAvaliacao(element) {
            
            this.loader = !this.loader;

            this.RequestGet('Reserva/BuscarAvaliacaoEmpresa/'+element.id,
            (response) => {

                let labelEndereco = element.endereco.logradouro +', '
                                + element.endereco.numero + ' - '
                                + element.endereco.bairro + ', '
                                + element.endereco.cidade.nome

                if (response.data.length > 0)
                    this.nota = response.data.map(x => x.nota).reduce((a, b) => a + b) / response.data.length

                this.empresas.push({
                    id: element.id,
                    nome: element.nome,
                    endereco: labelEndereco,
                    telefone: element.telefone,
                    imagem: window.atob(element.imagem),

                    configuracoesEmpresaId: element.configuracoesEmpresa.id,
                    diasAtendimento: element.configuracoesEmpresa.diasAtendimento,
                    timeInicial: this.parseTimeDate(element.configuracoesEmpresa.horarioInicio),
                    timeFinal: this.parseTimeDate(element.configuracoesEmpresa.horarioFim),
                    reservaPorPeriodo: element.configuracoesEmpresa.ehPorPeriodo,
                    utilizarServico: element.configuracoesEmpresa.utilizaServico,
                    quantidadePessoas: element.configuracoesEmpresa.quantidadePessoas,

                    bloquearReserva: element.empresaAdicional.bloqueiaReserva,
                    exibirMensagemRapida: element.empresaAdicional.exibirMensagemRapida,
                    mensagemRapida: element.empresaAdicional.mensagemRapida,
                    aceitaReservaAutomativamente: element.empresaAdicional.aceitaReservaAutomaticamente,
                    nota: this.nota,
                    quantidadeAvaliacoes: response.data.length
                })  

                this.empresasView = this.empresas

            },
            (error) => this.RetornoErro(error),
            () => (this.loader = !this.loader))
        },
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
        color: green;
    }
</style>