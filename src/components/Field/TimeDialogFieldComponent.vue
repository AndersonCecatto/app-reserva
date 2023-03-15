<template>
    <v-dialog
        ref="dialog"
        v-model="modal"
        :return-value.sync="time"
        persistent
        width="290px"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-text-field
                v-model="time"
                :label="titulo"
                prepend-icon="mdi-clock-time-four-outline"
                readonly
                v-bind="attrs"
                v-on="on"
                :rules="requiredRules"
                color="green"
            ></v-text-field>
        </template>
            <v-time-picker
                v-if="modal"
                v-model="time"
                full-width
                format="24hr"
                required
                color="green"
                :min="minimo"
                :max="maximo"
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
                @click="$refs.dialog.save(time), RetornoTime()"
            >
                OK
            </v-btn>
            </v-time-picker>
    </v-dialog>
</template>
<script>
export default {
    name: 'TimeDialogFieldComponent',
    data: () => ({
        time: null,
        modal: false,
        requiredRules: [
            v => v != null || 'Campo Obrigatório.',
        ]
    }),

    methods: {
        RetornoTime() {
            this.$emit('retornoTime', this.time)
        }
    },
    
    created() {
        this.time = this.recebeTime
    },

    props: {
        titulo: String,
        recebeTime: String,
        minimo: String,
        maximo: String
    }
}
</script>
<style>
    
</style>