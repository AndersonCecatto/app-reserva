<template>
    <v-card class="pb-3">
        <alert-component :texto-alerta="textoAlerta" :tipo='tipoAlerta' v-if="alerta == true"/>
        <v-card-title>
            <v-row class="pl-5">{{ dadosEmpresa.nome }}</v-row>
            <v-row class="pr-6">
                <v-spacer></v-spacer>
                <h6>Reservar</h6>
            </v-row>
            </v-card-title>
        <v-form
            ref="form" 
            lazy-validation
            class="px-7 mt-3"
        >
            <auto-complete-field-component 
                Label="Usuário" 
                Icon="mdi-account-circle" 
                Url="Usuario/Clientes"
                @retorno="retornoUsuario"
                v-if="this.dadosUsuario.EmpresaId != ''"
                />
            <data-dialog-field-component
                @retornoData="retornoData" 
                :regra-desabilita-campos="dadosEmpresa.diasAtendimento"
                titulo="Data"/>
            <time-dialog-field-component 
                @retornoTime="retornoTime" titulo="Horário"
                :minimo="dadosEmpresa.timeInicial"
                :maximo="dadosEmpresa.timeFinal"
                v-if="!dadosEmpresa.reservaPorPeriodo"
                />
            <v-select
                v-if="dadosEmpresa.reservaPorPeriodo"
                v-model="localPeriodo"
                :items="periodo"
                label="Periodo"
                prepend-icon="mdi-list-box"
                color="green"
                :rule="required"
            ></v-select>
            <v-select
                v-if="dadosEmpresa.utilizarServico"
                v-model="localServico"
                :items="servico"
                label="Servico"
                prepend-icon="mdi-list-box"
                color="green"
                :rule="required"
            ></v-select>
            <v-text-field
                v-model="QuantidadePessoas"
                prepend-icon="mdi-account-plus"
                label="Quantidade Pessoas"
                required
                type="number"
                pattern="\d*"
                :rules="required"
                color="green"
            >
            </v-text-field>
            <v-select
                v-model="comemoracao"
                :items="items"
                label="Comemoração"
                prepend-icon="mdi-party-popper"
                color="green"
                :rules="required"
            ></v-select>
            <v-textarea
                v-model="descricao"
                prepend-icon="mdi-message-arrow-right"
                label="Observações"
                color="green"
                :rules="rules"
                counter
            >
            </v-textarea>
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
        </v-form>
        <load-component :Ativo="loader"/>
    </v-card>
</template>
<script>

import LoadComponent from './LoadComponent.vue'
import AlertComponent from './AlertComponent.vue'
import GenericMethods from '@/mixins/GenericMethods'
import DataDialogFieldComponent from './Field/DataDialogFieldComponent.vue'
import TimeDialogFieldComponent from './Field/TimeDialogFieldComponent.vue'
import RequestMethods from '@/mixins/RequestMethods'
import AutoCompleteFieldComponent from './Field/AutoCompleteFieldComponent.vue'

export default {

  components: { LoadComponent, AlertComponent, DataDialogFieldComponent, TimeDialogFieldComponent, AutoCompleteFieldComponent },

    name: 'AgendarComponent',
    data: vm => ({
        loader: false,
        date: new Date().toLocaleDateString(),
        modal2: false,
        time: null,
        modal: false,
        comemoracao: "Não",
        descricao: '',
        items: ['Sim', 'Não'],
        periodo: [],
        servico: [],
        QuantidadePessoas: '',
        localPeriodo: null,
        localServico: null,
        usuarioId: null,
        requiredPeopleRules: [
            v => v != null && v != 0 || 'Campo Obrigatório.'
        ],
        requiredRules: [
            v => v != null || 'Campo Obrigatório.',
        ],
        rules: [v => v.length <= 100 || 'Máximo 100 caracteres'],
    }),
    mixins: [GenericMethods, RequestMethods],
    methods: {

        retornoUsuario(retorno) {
            this.usuarioId = retorno?.id
        },

        retornoData(retorno) {
            this.date = retorno
        },

        retornoTime(retorno) {
            this.time = retorno
        },

        requestSalvarReserva() {

            this.loader = !this.loader;

            this.RequestPost('Reserva',
            {
                dataReserva: this.parseDate(this.date),
                dataCadastro: new Date().toISOString(),
                horario: this.time != null ? this.parseTime(this.date, this.time) : null,
                periodoId: this.localPeriodo != null ? this.localPeriodo.replace(/\D+/g, '') : null,
                servicoId: this.localServico != null ? this.localServico.substr(0,5).replace(/\D+/g, '') : null,
                empresaId: this.dadosEmpresa.id,
                usuarioId: this.usuarioId ?? this.dadosUsuario.Id,
                ativo: false,
                quantidadePessoas: this.QuantidadePessoas,
                ehComemoracao: this.comemoracao == 'Sim',
                descricaoComemoracao: this.descricao,
                cancelada: false,
                reservado: this.dadosEmpresa.aceitaReservaAutomativamente
            },
            () => 
                {
                    this.EnableAlert("Concluido com sucesso.", "success")
                    this.$emit('reservado', true)
                },
            (error) => this.RetornoErro(error),
            () => (this.loader = !this.loader))
        },

        Salvar() {

            if (!this.$refs.form.validate()) 
                return  

            this.requestCapacidadeReserva()
        },

        requestBuscarPeriodoPorEmpresaId() {

            this.loader = !this.loader;

            this.RequestGet('Periodo/'+this.dadosEmpresa.id+'/false',
            (retorno) => {
                retorno.data.forEach(element => {
                    this.periodo.push(element.id + ' - ' + element.descricao)
                });

                if (this.periodo.length > 0)
                    this.localPeriodo = this.periodo[0]
                
            }, 
            (error) => this.RetornoErro(error),
            () => (this.loader = !this.loader))
        },

        requestBuscarServicoPorEmpresaId() {

            this.loader = !this.loader;

            this.RequestGet('Servico/'+this.dadosEmpresa.id+'/false',
            (retorno) => {
                retorno.data.forEach(element => {
                    this.servico.push(element.id + ' - ' + element.descricao + ' - R$ '+ parseFloat(element.valor).toFixed(2))
                });

                if (this.servico.length > 0)
                    this.localServico = this.servico[0]
                
            }, 
            (error) => this.RetornoErro(error),
            () => (this.loader = !this.loader))
        },

        requestCapacidadeReserva() {
            
            this.loader = !this.loader;

            this.RequestPost('Reserva/CapacidadeReserva',
            {
                empresaId: this.dadosEmpresa.id,
                dataReserva: this.parseDate(this.date),
                horario: this.time != null ? this.parseTime(this.date, this.time) : null,
                periodoId: this.localPeriodo != null ? this.localPeriodo.replace(/\D+/g, '') : null
            },
            (retorno) => {
                if (retorno.data + parseInt(this.QuantidadePessoas) > this.dadosEmpresa.quantidadePessoas) {
                    this.EnableAlert("Capacidade maxima atingida para o dia "+this.date, "warning")
                    return
                }

                this.requestSalvarReserva()
            }, 
            (error) => this.RetornoErro(error),
            () => (this.loader = !this.loader))
        },
    },

    created() {
        
        if (this.dadosEmpresa.reservaPorPeriodo)
            this.requestBuscarPeriodoPorEmpresaId()

        if (this.dadosEmpresa.utilizarServico)
            this.requestBuscarServicoPorEmpresaId()
    },

    props: {
        dadosEmpresa: Object,
        dadosUsuario: Object
    }
}
</script>
<style>
    
</style>