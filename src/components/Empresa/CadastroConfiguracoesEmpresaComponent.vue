<template>
    <v-form 
        ref="form" 
        lazy-validation
        class="px-4 mt-3">
        <time-dialog-field-component 
            @retornoTime="retornoTimeInicial" 
            titulo="Horário Inicio Reservas"
            :recebe-time="localTimeInicial"/>
        <time-dialog-field-component 
            @retornoTime="retornoTimeFinal" 
            titulo="Horário Fim Reservas"
            :recebe-time="localTimeFinal"/>
        <v-select
            v-model="localDiasAtendimento"
            :items="diasAtendimentoSemana"
            attach
            chips
            label="Dias de Atendimento"
            color="green"
            prepend-icon="mdi-list-box"
            multiple
            :rules="required"
        ></v-select>
        <v-select
            v-model="localReservaPorPeriodo"
            :items="items"
            label="Reserva por Periodo"
            prepend-icon="mdi-list-box"
            color="green"
            @change="change"
            :rules="required"
        ></v-select>
        <v-select
            v-model="localUtilizaServico"
            :items="items"
            label="Utiliza Servicos"
            prepend-icon="mdi-list-box"
            color="green"
            :rules="required"
        ></v-select>
        <v-select
            v-model="localReservaPorMesa"
            :items="items"
            label="Reserva por mesas"
            prepend-icon="mdi-list-box"
            color="green"
        ></v-select>
        <v-text-field
            v-model="localQuantidadeMesas"
            prepend-icon="mdi-account-plus"
            label="Quantidade Mesas"
            required
            type="number"
            pattern="\d*"
            :rules="requiredTableRules"
            color="green"
            :disabled="localReservaPorMesa == 'Não'"
        />
        <v-select
            v-model="localReservaPorPessoas"
            :items="items"
            label="Reserva por Pessoas"
            prepend-icon="mdi-list-box"
            color="green"
        ></v-select>
        <v-text-field
            v-model="localQuantidadePessoas"
            prepend-icon="mdi-account-plus"
            label="Quantidade Pessoas"
            required
            type="number"
            pattern="\d*"
            :rules="requiredPeopleRules"
            color="green"
            :disabled="localReservaPorPessoas == 'Não'"
        />
        <v-row class="px-3 py-7">
            <v-btn
                outlined
                large
                block
                color="green"
                @click="Salvar()"
                >
                <v-icon left> mdi-check-bold </v-icon>
                Confirmar
            </v-btn>
        </v-row>
        <load-component :Ativo="loader"/>
    </v-form>
</template>
<script>

import api from '@/services/api';
import LoadComponent from '../LoadComponent.vue';
import TimeDialogFieldComponent from '../Field/TimeDialogFieldComponent.vue';
import GenericMethods from '@/mixins/GenericMethods';
import RequestMethods from '@/mixins/RequestMethods';

export default {
    components: { LoadComponent, TimeDialogFieldComponent },

    name: 'CadastroConfiguracoesEmpresaComponent',

    mixins: [GenericMethods, RequestMethods],

    data: () => ({
        loader: false,
        modal1: false,
        modal2: false,
        items: ['Sim', 'Não'],
        localReservaPorPessoas: null,
        localTimeInicial: null,
        localTimeFinal: null,
        localReservaPorPeriodo: null,
        localReservaPorMesa: null,
        localQuantidadeMesas: null,
        localQuantidadePessoas: null,
        localDiasAtendimento: [],
        diasAtendimentoSemana: [
            'Segunda-Feira', 'Terça-Feira',
            'Quarta-Feira', 'Quinta-Feira',
            'Sexta-Feira', 'Sabado', 'Domindo'
        ],
        requiredPeopleRules: [
            v => v != null  || 'Campo Obrigatório.',
            // v => v != 0 && this.checkReservaPorPessoa() || 'Campo Obrigatório.'
        ],
        requiredTableRules: [
            v => v != null || 'Campo Obrigatório.', 
            // v => v != 0 && this.checkReservaPorMesa() || 'Campo Obrigatório.'
        ],
    }),

    methods: {
        checkReservaPorMesa() {
            return this.localReservaPorMesa == 'Sim'
        },

        checkReservaPorPessoa() {
            return this.localReservaPorPessoas == 'Sim'
        },

        change(event) {
            this.$emit('reservaPorPeriodo', event)
        },
        Salvar(){
            
            if (!this.$refs.form.validate()) 
                return 

            this.loader = !this.loader;

            this.RequestPut('ConfiguracoesEmpresa',
            {
                Id: this.retornoConfiguracoes.ConfiguracoesEmpresaId,
                HorarioInicio: this.parseTime(this.FormatDate(new Date().toISOString().substring(0,10)), this.localTimeInicial), //new Date(new Date().toISOString().substring(0,10) + ' ' + this.localTimeInicial+':00.000Z').toISOString(),
                HorarioFim: this.parseTime(this.FormatDate(new Date().toISOString().substring(0,10)), this.localTimeFinal),//new Date(new Date().toISOString().substring(0,10) + ' ' + this.localTimeFinal+':00.000Z').toISOString(),
                EhPorMesas: this.localReservaPorMesa == "Sim",
                QuantidadeMesas: this.localReservaPorMesa != "Sim" ? 0 : this.localQuantidadeMesas,
                EhPorPessoas: this.localReservaPorPessoas == "Sim",
                QuantidadePessoas: this.localReservaPorPessoas != "Sim" ? 0 : this.localQuantidadePessoas,
                TempoReservaMinutos: 0,
                EhPorPeriodo: this.localReservaPorPeriodo == "Sim",
                utilizaServico: this.localUtilizaServico == "Sim",
                DiasAtendimento: this.selecionarDiasAtendimentoBanco()
            },
            (retorno) => this.$emit('response', { success: true, response: retorno }),
            (error) => this.$emit('response', { success: false, response: error }),
            () => (this.loader = !this.loader))
        },
        
        retornoTimeInicial(retorno) {
            this.localTimeInicial = retorno
        },

        retornoTimeFinal(retorno) {
            this.localTimeFinal = retorno
        },

        selecionarDiasAtendimentoBanco() {

            var retornoBanco = ''
            this.localDiasAtendimento.forEach(dias => {
                
                switch (dias) {
                    case 'Segunda-Feira':
                        retornoBanco += '0;'
                        break;
                    case 'Terça-Feira':
                        retornoBanco += '1;'
                        break;
                    case 'Quarta-Feira':
                        retornoBanco += '2;'
                        break;
                    case 'Quinta-Feira':
                        retornoBanco += '3;'
                        break;
                    case 'Sexta-Feira':
                        retornoBanco +='4;'
                        break;
                    case 'Sabado':
                        retornoBanco +='5;'
                        break;
                    case 'Domindo':
                        retornoBanco +='6;'
                        break;
                    default:
                        break;
                }
            })

            return retornoBanco.slice(0, -1)
        },

        selecionarDiasAtendimento(diasAtendimento) {
            diasAtendimento.split(';').forEach(dias => {
                
                switch (dias) {
                    case '0':
                        this.localDiasAtendimento.push('Segunda-Feira')
                        break;
                    case '1':
                        this.localDiasAtendimento.push('Terça-Feira')
                        break;
                    case '2':
                        this.localDiasAtendimento.push('Quarta-Feira')
                        break;
                    case '3':
                        this.localDiasAtendimento.push('Quinta-Feira')
                        break;
                    case '4':
                        this.localDiasAtendimento.push('Sexta-Feira')
                        break;
                    case '5':
                        this.localDiasAtendimento.push('Sabado')
                        break;
                    case '6':
                        this.localDiasAtendimento.push('Domindo')
                        break;
                    default:
                        break;
                }
            });
        }
    },
    created() {

        this.localTimeInicial = this.retornoConfiguracoes.TimeInicial
        this.localTimeFinal = this.retornoConfiguracoes.TimeFinal
        this.localReservaPorPeriodo = this.retornoConfiguracoes.ReservaPorPeriodo
        this.localReservaPorMesa = this.retornoConfiguracoes.ReservaPorMesa
        this.localQuantidadeMesas = this.retornoConfiguracoes.QuantidadeMesas
        this.localReservaPorPessoas = this.retornoConfiguracoes.ReservaPorPessoas
        this.localQuantidadePessoas = this.retornoConfiguracoes.QuantidadePessoas
        this.localUtilizaServico = this.retornoConfiguracoes.UtilizaServico
        this.selecionarDiasAtendimento(this.retornoConfiguracoes.DiasAtendimento)
    },

    watch: {
        localReservaPorMesa(newValue) {
            if (newValue != 'Sim')
                this.localQuantidadeMesas = ''
        },
        localReservaPorPessoas(newValue) {
            if (newValue != 'Sim')
                this.localQuantidadePessoas = ''
        },
        localReservaPorPeriodo(newValue) {

        },
    },

    props: {
        retornoConfiguracoes: Object
    }
}
</script>
<style>
    
</style>