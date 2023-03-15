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
                        :retorno-empresa="RetornoDadosEmpresa"
                        :dados-usuario="dadosUsuario"
                        @response="Alerta"
                    />
                </v-tab-item>
                <v-tab>Endereco</v-tab>
                <v-tab-item>
                    <cadastro-endereco-component
                        
                        :retorno-endereco="RetornoDadosEndereco"
                        @response="Alerta"
                    />
                </v-tab-item>
                <v-tab>Configuracoes Empresa</v-tab>
                <v-tab-item>
                    <cadastro-configuracoes-empresa-component
                        
                        :retorno-configuracoes="RetornoDadosConfiguracoesEmpresa"
                        @reservaPorPeriodo="reservaPorPeriodo"
                        @response="Alerta"
                    />
                </v-tab-item>
                <v-tab>Adicionais</v-tab>
                <v-tab-item>
                    <cadastro-adicionais-component
                        
                        :retorno-empresa-adicional="RetornoDadosEmpresaAdicional"
                        @response="Alerta"
                    />
                </v-tab-item>
                <v-tab v-if="RetornoDadosConfiguracoesEmpresa?.ReservaPorPeriodo == 'Sim'" >Periodo</v-tab>
                <!-- <v-tab-item v-if="ReservaPorPeriodo != 'Não'"> -->
                <v-tab-item>
                    <cadastro-periodo-component 
                        v-if="RetornoDadosConfiguracoesEmpresa?.ReservaPorPeriodo == 'Sim'" 
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
        RetornoDadosEmpresa: null,

        modal1: false,
        modal2: false,
        RetornoDadosEndereco: null,
        RetornoDadosConfiguracoesEmpresa: null,
        RetornoDadosEmpresaAdicional: null,

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
            
            this.RetornoDadosEmpresa = {
                RazaoSocial: response.data.nome,
                Cnpj: response.data.cpfCnpj,
                Telefone: response.data.telefone,
                Email: response.data.email,
                DataCadastroEmpresa: response.data.dataCadastro,
                //Imagem: response.data.imagem,
                ImagemName: response.data.imagemName,
                ConfiguracoesEmpresaId: response.data.configuracoesEmpresa.id,
                EmpresaAdicionalId: response.data.empresaAdicional.id,
                EnderecoId: response.data.endereco.id
            }

            this.RetornoDadosEndereco = {
                Logradouro: response.data.endereco.logradouro,
                EnderecoId: response.data.endereco.id,
                Bairro: response.data.endereco.bairro,
                Cep: response.data.endereco.cep,
                Complemento: response.data.endereco.complemento,
                Numero: response.data.endereco.numero,
                Cidade: response.data.endereco.cidade,
                Estado: response.data.endereco.cidade.estado,
                CidadeId: response.data.endereco.cidade.id
            }

            this.RetornoDadosConfiguracoesEmpresa = {
                ConfiguracoesEmpresaId: response.data.configuracoesEmpresa.id,
                TimeInicial: this.parseTimeDate(response.data.configuracoesEmpresa.horarioInicio),
                TimeFinal: this.parseTimeDate(response.data.configuracoesEmpresa.horarioFim),
                ReservaPorPeriodo: response.data.configuracoesEmpresa.ehPorPeriodo ? "Sim" : "Não",
                ReservaPorPessoas: response.data.configuracoesEmpresa.ehPorPessoas ? "Sim" : "Não",
                QuantidadePessoas: response.data.configuracoesEmpresa.quantidadePessoas,
                ReservaPorMesa: response.data.configuracoesEmpresa.ehPorMesas ? "Sim" : "Não",
                QuantidadeMesas: response.data.configuracoesEmpresa.quantidadeMesas,
                DiasAtendimento: response.data.configuracoesEmpresa.diasAtendimento
            }
            
            this.RetornoDadosEmpresaAdicional = {
                EmpresaAdicionalId: response.data.empresaAdicional.id,
                BloquearReserva: response.data.empresaAdicional.bloqueiaReserva ? "Sim" : "Não",
                AceitaReservaAutomaticamente: response.data.empresaAdicional.aceitaReservaAutomaticamente ? "Sim" : "Não",
                PermiteReagendarReserva: response.data.empresaAdicional.permiteReagendarReserva ? "Sim" : "Não",
                ExibirMensagemRapida: response.data.empresaAdicional.exibirMensagemRapida ? "Sim" : "Não",
                TempoPermitidoCancelamento: response.data.empresaAdicional.tempoPermitidoCancelamento,
                MensagemRapida: response.data.empresaAdicional.mensagemRapida ?? ''
            }
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