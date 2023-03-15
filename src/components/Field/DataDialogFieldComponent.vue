<template>
    <v-dialog
        ref="dialog"
        v-model="modal"
        :return-value.sync="dateFormatted"
        persistent
        width="290px"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-text-field
                v-model="dateFormatted"
                :label="titulo"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
                color="green"
            ></v-text-field>
        </template>
        <v-date-picker
            v-model="date"
            scrollable
            locale="pt-br"
            color="green"
            :allowed-dates="disablePastDates"
        >
        <v-spacer></v-spacer>
        <v-btn
            text
            @click="modal = false"
        >
            Cancelar
        </v-btn>
        <v-btn
            text
            color="green"
            @click="$refs.dialog.save(dateFormatted), RetornoData()"
        >
            OK
        </v-btn>
        </v-date-picker>
    </v-dialog>
</template>
<script>

import GenericMethods from '@/mixins/GenericMethods'

export default {

    name:'DateDialogFieldComponent',
    mixins: [GenericMethods],

    data: (vm) => ({
        date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substring(0, 10),
        dateFormatted: vm.FormatDate((new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substring(0, 10)),
        modal: false
    }),

    methods: {
        RetornoData() {
            this.$emit('retornoData', this.dateFormatted)
        },

        //Desabilita os dias no calendario
        disablePastDates(val) {
            
            if (this.regraDesabilitaCampos != null) {
                return val >= this.parseDate(new Date().toLocaleDateString()) && this.regraDesabilitaCampos.split(';').some((x) => new Date(val).getDay() == x)
            }

            return val
        },

        verificarData(data) {
            
            if (this.regraDesabilitaCampos != null){
                if (this.regraDesabilitaCampos.split(';').some((x) => data.getDay() - 1 == x)){
                    let dt = (new Date(data - (data).getTimezoneOffset() * 60000)).toISOString().substring(0, 10)
                    this.dateFormatted = this.FormatDate(dt)
                    return 
                }
                
                data.setDate(data.getDate() + 1)
                this.verificarData(data)
            }
        }
    },

    watch: {
        date (val) {
            this.dateFormatted = this.FormatDate(this.date)
        },
        dateFormatted(val) {
            debugger
            this.$emit('retornoData', this.dateFormatted)
        }
    },

    created() {
        this.verificarData(this.currentDate)
    },

    props: {
        regraDesabilitaCampos: String,
        titulo: String,
        recebeData: Date
    }
}
</script>
<style>
    
</style>