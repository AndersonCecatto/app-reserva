<template>
    <v-card class="pb-3">
        <alert-component :texto-alerta="textoAlerta" :tipo='tipoAlerta' v-if="alerta == true"/>
        <v-card-title>Empresa</v-card-title>
        <v-card-text>
            <v-tabs color="green">
                <v-tabs-slider></v-tabs-slider>
                <v-tab>Informações Empresa</v-tab>
                <v-tab-item>
                    <cadastro-empresa-component
                        :razao-social="RazaoSocial"
                        :cnpj="Cnpj"
                        :telefone="Telefone"
                        :email="Email"
                        :configuracoes-empresa-id="ConfiguracoesEmpresaId"
                        :endereco-id="EnderecoId"
                        :data-cadastro="DataCadastroEmpresa"
                        :empresa-adicional-id="empresaAdicionalId"
                        :imagem-name="ImagemName"
                        :imagem="Imagem"
                        :dados-usuario="dadosUsuario"
                        @response="Alerta"
                    />
                </v-tab-item>
                <v-tab>Endereco</v-tab>
                <v-tab-item>
                    <cadastro-endereco-component
                        :endereco-id="EnderecoId"
                        :logradouro="Logradouro"
                        :bairro="Bairro"
                        :numero="Numero"
                        :complemento="Complemento"
                        :cep="Cep"
                        :estado="Estado"
                        :cidade="Cidade"
                        :cidade-id="CidadeId"
                        @response="Alerta"
                    />
                </v-tab-item>
                <v-tab>Configuracoes Empresa</v-tab>
                <v-tab-item>
                    <cadastro-configuracoes-empresa-component
                        :configuracoes-empresa-id="ConfiguracoesEmpresaId"
                        :time-inicial="timeInicial"
                        :time-final="timeFinal"
                        :reserva-por-periodo="ReservaPorPeriodo"
                        :reserva-por-mesa="ReservaPorMesa"
                        :quantidade-mesas="QuantidadeMesas"
                        :reserva-por-pessoas="ReservaPorPessoas"
                        :quantidade-pessoas="QuantidadePessoas"
                        :dias-atendimento="DiasAtendimento"
                        @reservaPorPeriodo="reservaPorPeriodo"
                        @response="Alerta"
                    />
                </v-tab-item>
                <v-tab>Adicionais</v-tab>
                <v-tab-item>
                    <cadastro-adicionais-component
                        :empresa-adicional-id="empresaAdicionalId"
                        :exibir-mensagem-rapida="exibirMensagemRapida"
                        :bloquear-reserva="bloquearReserva"
                        :aceita-reserva-automaticamente="aceitaReservaAutomaticamente"
                        :permite-reagendar-reserva="permiteReagendarReserva"
                        :tempo-permitido-cancelamento="tempoPermitidoCancelamento"
                        :mensagem-rapida="mensagemRapida"
                        @response="Alerta"
                    />
                </v-tab-item>
                <v-tab v-if="ReservaPorPeriodo == 'Sim'" >Periodo</v-tab>
                <!-- <v-tab-item v-if="ReservaPorPeriodo != 'Não'"> -->
                <v-tab-item>
                    <cadastro-periodo-component 
                        v-if="ReservaPorPeriodo == 'Sim'" 
                        :dados-usuario="dadosUsuario"
                        @response="Alerta"/>
                </v-tab-item>
            </v-tabs>
        </v-card-text>
        <load-component :Ativo="loader"/>
    </v-card>
</template>
<script>

import AutoCompleteFieldComponent from './Field/AutoCompleteFieldComponent.vue';
import LoadComponent from './LoadComponent.vue';
import AlertComponent from './AlertComponent.vue';
import CadastroEmpresaComponent from './Empresa/CadastroEmpresaComponent.vue';
import GenericMethods from '@/mixins/GenericMethods';
import CadastroEnderecoComponent from './Empresa/CadastroEnderecoComponent.vue';
import CadastroConfiguracoesEmpresaComponent from './Empresa/CadastroConfiguracoesEmpresaComponent.vue';
import CadastroAdicionaisComponent from './Empresa/CadastroAdicionaisComponent.vue';
import CadastroPeriodoComponent from './Empresa/CadastroPeriodoComponent.vue';
import RequestMethods from '@/mixins/RequestMethods';

export default {
    name: "ConfiguracoesEmpresaComponent",

    components: { 
        AutoCompleteFieldComponent, 
        LoadComponent, 
        AlertComponent, 
        CadastroEmpresaComponent, 
        CadastroConfiguracoesEmpresaComponent, 
        CadastroEnderecoComponent,
        CadastroAdicionaisComponent,
        CadastroPeriodoComponent 
    },
    mixins: [GenericMethods, RequestMethods],
    data: () => ({
        EmpresaId: null,
        RazaoSocial: null,
        Cnpj: null,
        Telefone: null,
        Email: null,
        DataCadastroEmpresa: null,
        Imagem: null,
        ImagemName: null,

        modal1: false,
        modal2: false,
        ConfiguracoesEmpresaId: null,
        timeInicial: null,
        timeFinal: null,
        ReservaPorMesa: "Não",
        ReservaPorPessoas: "Não",
        ReservaPorPeriodo: null,
        QuantidadeMesas: null,
        QuantidadePessoas: null,
        DiasAtendimento: null,

        items: ['Sim', 'Não'],
        EnderecoId: null,
        Logradouro: null,
        Bairro: null,
        Numero: null,
        Complemento: null,
        Cep: null,
        Estado: null,
        Cidade: null,
        CidadeId: null,
        
        empresaAdicionalId: null,
        bloquearReserva: null,
        aceitaReservaAutomaticamente: null,
        permiteReagendarReserva: null,
        exibirMensagemRapida: null,
        tempoPermitidoCancelamento: null,
        mensagemRapida: null,

        requiredRules: [
            v => v != null || 'Campo Obrigatório.',
        ],
        requiredPeopleRules: [
            v => v != null && v != 0 || 'Campo Obrigatório.'
        ],
    }),
    methods: {
        Alerta(retorno) {
            if (retorno.success) {
                this.EnableAlert("Concluido com sucesso.", "success")
                window.scrollTo(0,0);
            } 
            else {
                this.EnableAlert(retorno.response.message, "error")
                window.scrollTo(0,0);
            }
        },

        reservaPorPeriodo(val) {
            this.ReservaPorPeriodo = val
        },

        requestEmpresa() {
            this.loader = !this.loader;

            this.RequestGet('Empresa/'+this.dadosUsuario.EmpresaId,
            (retorno) => this.RetornoEmpresa(retorno),
            (error) => this.RetornoErro(error),
            () => (this.loader = !this.loader))
        },

        RetornoEmpresa(response) {
            
            debugger 

            this.RazaoSocial = response.data.nome
            this.Cnpj = response.data.cpfCnpj
            this.Telefone = response.data.telefone
            this.Email = response.data.email
            this.DataCadastroEmpresa = response.data.dataCadastro
            this.Imagem = response.data.imagem
            this.ImagemName = response.data.imagemName

            this.EnderecoId = response.data.endereco.id
            this.Logradouro = response.data.endereco.logradouro
            this.Bairro = response.data.endereco.bairro
            this.Cep = response.data.endereco.cep
            this.Complemento = response.data.endereco.complemento
            this.Numero = response.data.endereco.numero
            this.Cidade = response.data.endereco.cidade
            this.Estado = response.data.endereco.cidade.estado
            this.CidadeId = response.data.endereco.cidade.id

            this.ConfiguracoesEmpresaId = response.data.configuracoesEmpresa.id
            this.timeInicial = this.parseTimeDate(response.data.configuracoesEmpresa.horarioInicio),
            this.timeFinal = this.parseTimeDate(response.data.configuracoesEmpresa.horarioFim),
            this.ReservaPorPeriodo = response.data.configuracoesEmpresa.ehPorPeriodo ? "Sim" : "Não"
            this.ReservaPorPessoas = response.data.configuracoesEmpresa.ehPorPessoas ? "Sim" : "Não"
            this.QuantidadePessoas = response.data.configuracoesEmpresa.quantidadePessoas
            this.ReservaPorMesa = response.data.configuracoesEmpresa.ehPorMesas ? "Sim" : "Não"
            this.QuantidadeMesas = response.data.configuracoesEmpresa.quantidadeMesas
            this.DiasAtendimento = response.data.configuracoesEmpresa.diasAtendimento
            
            this.empresaAdicionalId = response.data.empresaAdicional.id
            this.bloquearReserva = response.data.empresaAdicional.bloqueiaReserva ? "Sim" : "Não"
            this.aceitaReservaAutomaticamente = response.data.empresaAdicional.aceitaReservaAutomaticamente ? "Sim" : "Não"
            this.permiteReagendarReserva = response.data.empresaAdicional.permiteReagendarReserva ? "Sim" : "Não"
            this.exibirMensagemRapida = response.data.empresaAdicional.exibirMensagemRapida ? "Sim" : "Não"
            this.tempoPermitidoCancelamento = response.data.empresaAdicional.tempoPermitidoCancelamento
            this.mensagemRapida = response.data.empresaAdicional.mensagemRapida ?? ''
        },
    },
    
    created() {
        this.requestEmpresa()
    },

    watch: {

        refresh (val) {
            this.requestEmpresa()
        }

    },

    props: {
        refresh: Boolean,
        dadosUsuario: Object
    }
}
</script>
<style>
    
</style>