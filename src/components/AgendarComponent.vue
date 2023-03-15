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
                Url="Usuario"
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
            <v-text-field
                v-model="descricao"
                prepend-icon="mdi-message-arrow-right"
                label="Descrição"
                :disabled="DesabilitarCampoDscricao()"
                color="green"
            >
            </v-text-field>
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
        date: vm.FormatDate(new Date().toISOString().substring(0, 10)),
        modal2: false,
        time: null,
        modal: false,
        comemoracao: "Não",
        descricao: null,
        items: ['Sim', 'Não'],
        periodo: [],
        QuantidadePessoas: null,
        localPeriodo: null,
        usuarioId: null,
        requiredPeopleRules: [
            v => v != null && v != 0 || 'Campo Obrigatório.'
        ],
        requiredRules: [
            v => v != null || 'Campo Obrigatório.',
        ]
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

        DesabilitarCampoDscricao() {
            if(this.comemoracao != 'Sim')
            {
                this.descricao = null;
                return true
            }
        
            return false
        },

        requestSalvarReserva() {

            this.loader = !this.loader;

            this.RequestPost('Reserva',
            {
                dataReserva: this.parseDate(this.date),
                dataCadastro: new Date().toISOString(),
                horario: this.time != null ? this.parseTime(this.date, this.time) : null,
                periodoId: this.localPeriodo != null ? this.localPeriodo.replace(/\D+/g, '') : null,
                empresaId: this.dadosEmpresa.id,
                usuarioId: this.usuarioId ?? this.dadosUsuario.Id,
                ativo: false,
                quantidadePessoas: this.QuantidadePessoas,
                ehComemoracao: false,
                descricaoComemoracao: '',
                cancelada: false
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

            // if (this.dadosEmpresa.bloquearReserva) {
            //     this.EnableAlert(this.dadosEmpresa.mensagemRapida, "warning")
            //     window.scrollTo(0,0);
            //     return
            // }
           
        },

        requestBuscarPeriodoPorEmpresaId() {

            this.loader = !this.loader;

            this.RequestGet('Periodo/'+this.dadosEmpresa.id,
            (retorno) => {
                retorno.data.forEach(element => {
                    this.periodo.push(element.id + ' - ' + element.descricao)
                });

                if (this.periodo.length > 0)
                    this.localPeriodo = this.periodo[0]
                
            }, 
            (error) => this.$emit('response', { success: false, response: error }),
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
                debugger
                if (retorno.data + parseInt(this.QuantidadePessoas) > this.dadosEmpresa.quantidadePessoas) {
                    this.EnableAlert("Capacidade maxima atingida para o dia "+this.date, "warning")
                    return
                }

                this.requestSalvarReserva()
            }, 
            (error) => this.$emit('response', { success: false, response: error }),
            () => (this.loader = !this.loader))
        },
    },

    created() {
        if (this.dadosEmpresa.reservaPorPeriodo)
            this.requestBuscarPeriodoPorEmpresaId()
    },

    props: {
        dadosEmpresa: Object,
        dadosUsuario: Object
    }
}
</script>
<style>
    
</style>