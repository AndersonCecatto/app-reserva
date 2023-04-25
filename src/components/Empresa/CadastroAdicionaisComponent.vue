<template>
    <v-form class="px-4 mt-3">
        <v-select
            v-model="localBloquearReserva"
            :items="items"
            label="Bloquear Reservas"
            prepend-icon="mdi-party-popper"
            color="green"
        ></v-select>
        <v-select
            v-model="localAceitaReservaAutomaticamente"
            :items="items"
            label="Aceitar reservas automaticamente"
            prepend-icon="mdi-party-popper"
            color="green"
        ></v-select>
        <v-select
            v-model="localPermiteReagendarReserva"
            :items="items"
            label="Permite reagendar reserva"
            prepend-icon="mdi-party-popper"
            color="green"
        ></v-select>
        <v-text-field
            v-model="localTempoPermitidoCancelamento"
            prepend-icon="mdi-clock-time-four-outline"
            label="Minutos permitidos cancelamento de reserva (Cliente)"
            required
            type="number"
            pattern="\d*"
            color="green"
        />
        <v-text-field
            v-model="localTempoToleranciaCancelamento"
            prepend-icon="mdi-clock-time-four-outline"
            label="Minutos permitidos tolerancia cancelamento automático"
            required
            type="number"
            pattern="\d*"
            color="green"
        />
        <v-select
            v-model="localExibirMensagemRapida"
            :items="items"
            label="Exibir Mensagem Rapida"
            prepend-icon="mdi-party-popper"
            color="green"
        ></v-select>
        <v-textarea
            v-model="localMensagemRapida"
            counter
            prepend-icon="mdi-account-plus"
            color="green"
            label="Mensagem Rápida"
            :rules="rules"
            :disabled="localExibirMensagemRapida != 'Sim'"
        ></v-textarea>
        <v-row class="px-3 py-7">
            <v-btn
                outlined
                large
                block
                color="green"
                @click="SalvarAdicional()"
                >
                <v-icon left> mdi-check-bold </v-icon>
                Confirmar
            </v-btn>
        </v-row>
        <load-component :Ativo="loader"/>
    </v-form>
</template>
<script>

import LoadComponent from '../LoadComponent.vue';
import GenericMethods from '@/mixins/GenericMethods';
import RequestMethods from '@/mixins/RequestMethods';

export default {
  components: { LoadComponent },
    name: 'CadastroAdicionaisComponent',

    mixins: [GenericMethods, RequestMethods],

    data: () => ({
        localBloquearReserva: null,
        localAceitaReservaAutomaticamente: null,
        localPermiteReagendarReserva: null,
        localExibirMensagemRapida: null,
        localTempoPermitidoCancelamento: null,
        localTempoToleranciaCancelamento: null,
        localMensagemRapida: '',
        items: ['Sim', 'Não'],
        rules: [v => v.length <= 50 || 'Máximo 50 caracteres'],
    }),

    methods: {
            SalvarAdicional(){
            
            this.loader = !this.loader;

            this.RequestPut('EmpresaAdicional',
            {
                Id: this.retornoEmpresaAdicional.EmpresaAdicionalId,
                BloqueiaReserva: this.localBloquearReserva == "Sim" ? true : false,
                AceitaReservaAutomaticamente: this.localAceitaReservaAutomaticamente == "Sim" ? true : false,
                PermiteReagendarReserva: this.localPermiteReagendarReserva == "Sim" ? true : false,
                TempoPermitidoCancelamento: this.localTempoPermitidoCancelamento,
                TempoToleranciaCancelamento: this.localTempoToleranciaCancelamento,
                ExibirMensagemRapida: this.localExibirMensagemRapida == "Sim" ? true : false,
                MensagemRapida: this.localExibirMensagemRapida == "Sim" ? this.localMensagemRapida : this.mensagemRapida,
            },
            (retorno) => {this.$emit('response', { success: true, response: retorno })}, 
            (error) => this.$emit('response', { success: false, response: error }),
            () => (this.loader = !this.loader))
        }
    },
    created() {
        this.localBloquearReserva = this.retornoEmpresaAdicional.BloquearReserva
        this.localAceitaReservaAutomaticamente = this.retornoEmpresaAdicional.AceitaReservaAutomaticamente
        this.localPermiteReagendarReserva = this.retornoEmpresaAdicional.PermiteReagendarReserva
        this.localExibirMensagemRapida = this.retornoEmpresaAdicional.ExibirMensagemRapida
        this.localTempoPermitidoCancelamento = this.retornoEmpresaAdicional.TempoPermitidoCancelamento
        this.localMensagemRapida = this.retornoEmpresaAdicional.MensagemRapida
    },

    props: {
        retornoEmpresaAdicional: Object
    }
}
</script>
<style>
    
</style>