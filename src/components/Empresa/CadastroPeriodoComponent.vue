<template>
    <div>
        <alert-component :texto-alerta="textoAlerta" :tipo='tipoAlerta' v-if="alerta == true"/>
        <v-row>
            <v-col cols="12" class="text-right">
                <v-btn
                    class="text-right"
                    outlined
                    large
                    right
                    color="primary"
                    @click="novo()"
                    >
                    Novo
                </v-btn>
            </v-col>
        </v-row>
        <v-data-table
            :headers="headers"
            :items="periodos"
            :footer-props="{
                'items-per-page-text':'Linhas por pagina',
                'items-per-page-options': [5, 10, 20]
            }"
            :header-props="{
                'sortByText': 'Ordenar'
            }"
        >
            <template v-slot:item.actions="{ item }">
                <v-icon
                    midium
                    class="mr-3"
                    @click="editarPeriodo(item)"
                >
                    mdi-pencil
                </v-icon>
                <v-icon
                    class="mr-3"
                    midium
                    @click="deletarPeriodo(item)"
                >
                    mdi-delete
                </v-icon>
            </template>
        </v-data-table>
        <load-component :Ativo="loader"/>
        <dialog-persistent-component 
            :item="itemEnvio" 
            titulo="Cadastrar Periodo" 
            :dialog="dialog" 
            tamanho="400" 
            @response="retornoDialog" 
            :acao="acao">
                <v-form>
                    <v-text-field
                        v-model="descricao"
                        label="Descrição"
                        prepend-icon="mdi-text-box-edit"
                    />
                </v-form>
        </dialog-persistent-component>
    </div>
</template>
<script>

import GenericMethods from '@/mixins/GenericMethods'
import LoadComponent from '../LoadComponent.vue'
import AlertComponent from '../AlertComponent.vue';
import DialogPersistentComponent from '../Field/DialogPersistentComponent.vue';
import RequestMethods from '@/mixins/RequestMethods';

export default {
    components: { LoadComponent, AlertComponent, DialogPersistentComponent },

    name: 'CadastroPeriodoComponent.vue',
    mixins: [GenericMethods, RequestMethods],
    data: () => ({
        headers: [
            { text: 'Código', width: "150", value: 'Id', },
            { text: 'Descricao', width: "750", value: 'Descricao', },
            { text: 'Ações', value: 'actions', sortable: false, align: "center" }
        ],
        periodos: [],
        descricao: null,
        acao: null,
        itemEnvio: null,
    }),

    methods: {
        novo() {
            this.acao = 'Cadastrar'
            this.descricao = null

            this.dialog = !this.dialog
        },
        requestBuscarPeriodoPorEmpresaId() {

            this.loader = !this.loader;

            this.RequestGet('Periodo/'+this.dadosUsuario.EmpresaId,
            (retorno) => this.RetornoPeriodo(retorno), 
            (error) => this.$emit('response', { success: false, response: error }),
            () => (this.loader = !this.loader))
        },

        RetornoPeriodo(retorno) {
            retorno.data.forEach(element => {
                this.periodos.push({
                        Id: element.id,
                        Descricao: element.descricao
                })
            });
        },
        
        retornoDialog(retorno) {

            if (retorno.acao == 'Cadastrar' && retorno.success)
                this.requestCadastrarPeriodo()
            else if (retorno.acao == 'Editar' && retorno.success)
                this.requestEditarPeriodo(retorno.response)

            this.dialog = !this.dialog
        },

        requestCadastrarPeriodo() {

            this.loader = !this.loader;

            this.periodos = []

            this.RequestPost('Periodo',
            {
                Descricao: this.descricao,
                EmpresaId: this.dadosUsuario.EmpresaId,
            },
            (retorno) => this.$emit('response', { success: true, response: retorno }), 
            (error) => this.$emit('response', { success: false, response: error }),
            () => {
                this.loader = !this.loader
                this.requestBuscarPeriodoPorEmpresaId()
            })
        },

        deletarPeriodo(item) {

            this.loader = !this.loader;

            this.periodos = []

            this.RequestDelete('Periodo/'+item.Id,
            (retorno) => this.$emit('response', { success: true, response: retorno }), 
            (error) => this.$emit('response', { success: false, response: error }),
            () => {
                this.loader = !this.loader
                this.requestBuscarPeriodoPorEmpresaId()
            })
        },

        editarPeriodo(item) {
            this.acao = 'Editar'
            this.itemEnvio = item
            this.descricao = item.Descricao

            this.dialog = !this.dialog
        },

        requestEditarPeriodo(item) {
            this.loader = !this.loader;

            this.periodos = []

            this.RequestPut('Periodo',
            {
                Id: item.Id,
                Descricao: this.descricao,
                EmpresaId: this.dadosUsuario.EmpresaId,
            },
            (retorno) => {this.$emit('response', { success: true, response: retorno })}, 
            (error) => this.$emit('response', { success: false, response: error }),
            () => {
                this.loader = !this.loader
                this.requestBuscarPeriodoPorEmpresaId()
            })
        }
    },
    
    created() {
        this.requestBuscarPeriodoPorEmpresaId()
    },

    props: {
        dadosUsuario: Object
    }
}
</script>
<style>
    
</style>