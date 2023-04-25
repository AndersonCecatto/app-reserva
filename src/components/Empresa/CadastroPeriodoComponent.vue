<template>
    <v-card class="pb-3">
        <alert-component :texto-alerta="textoAlerta" :tipo='tipoAlerta' v-if="alerta == true"/>
        <load-component :Ativo="loader"/>
        <v-card-title>
            Periodos
            <v-spacer/>
            <v-btn
                class="text-right mr-3"
                outlined
                large
                right
                color="primary"
                @click="novo()"
                >
                <v-icon left> mdi-plus </v-icon>
                    Novo
            </v-btn>
        </v-card-title>
        <v-card-text>
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
            :sort-desc.sync="sortDesc"
            :sort-by.sync="sortBy"
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
                        color="green"
                    />
                    <v-select
                        v-model="ativo"
                        :items="SimNao"
                        label="Ativo"
                        prepend-icon="mdi-list-box"
                        color="green"
                    />
                </v-form>
        </dialog-persistent-component>
        </v-card-text>
    </v-card>
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
            { text: 'Ativo', value: 'Ativo', },
            { text: 'Ações', value: 'actions', sortable: false, align: "center" }
        ],
        periodos: [],
        ativo: 'Sim',
        descricao: null,
        acao: null,
        itemEnvio: null,
        sortBy: 'Id',
        sortDesc: true,
    }),

    methods: {
        novo() {
            this.acao = 'Cadastrar'
            this.descricao = null

            this.dialog = !this.dialog
        },
        requestBuscarPeriodoPorEmpresaId() {

            this.loader = !this.loader;

            this.RequestGet('Periodo/'+this.dadosUsuario.EmpresaId+'/true',
            (retorno) => this.RetornoPeriodo(retorno),
            (error) => this.$emit('response', { success: false, response: error }),
            () => (this.loader = !this.loader))
        },

        RetornoPeriodo(retorno) {
            retorno.data.forEach(element => {
                this.periodos.push({
                        Id: element.id,
                        Descricao: element.descricao,
                        Ativo: element.ativo ? 'Sim' : 'Não'
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
                Ativo: this.ativo == 'Sim'
            },
            (retorno) => {
                this.EnableAlert("Concluido com sucesso.", "success")
            }, 
            (error) => this.RetornoErro(error),
            () => {
                this.loader = !this.loader
                this.requestBuscarPeriodoPorEmpresaId()
            })
        },

        deletarPeriodo(item) {

            this.loader = !this.loader;

            this.periodos = []

            this.RequestDelete('Periodo/'+item.Id,
            (retorno) => {
                if (retorno.data.dados == null)
                    this.EnableAlert(retorno.data.mensagem, "info")
                else
                    this.EnableAlert("Concluido com sucesso.", "success")
            }, 
            (error) => this.RetornoErro(error),
            () => {
                this.loader = !this.loader
                this.requestBuscarPeriodoPorEmpresaId()
            })
        },

        editarPeriodo(item) {
            this.acao = 'Editar'
            this.itemEnvio = item
            this.descricao = item.Descricao
            this.ativo = item.Ativo

            this.dialog = !this.dialog
        },

        requestEditarPeriodo(item) {
            this.loader = !this.loader;

            this.periodos = []

            this.RequestPut('Periodo',
            {
                Id: item.Id,
                Descricao: this.descricao,
                Ativo: this.ativo == 'Sim',
                EmpresaId: this.dadosUsuario.EmpresaId,
            },
            (retorno) => {
                this.EnableAlert("Concluido com sucesso.", "success")
            }, 
            (error) => this.RetornoErro(error),
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