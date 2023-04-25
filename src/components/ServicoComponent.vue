<template>
    <v-card class="pb-3">
        <alert-component :texto-alerta="textoAlerta" :tipo='tipoAlerta' v-if="alerta == true"/>
        <load-component :Ativo="loader"/>
        <v-card-title>
            Servicos
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
                :items="servicos"
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
                        @click="editarServico(item)"
                    >
                        mdi-pencil
                    </v-icon>
                    <v-icon
                        class="mr-3"
                        midium
                        @click="deletarServico(item)"
                    >
                        mdi-delete
                    </v-icon>
                </template>
            </v-data-table>
            <dialog-persistent-component
                :dialog="dialog" 
                titulo="Cadastrar Servico"
                tamanho="400"
                @response="retornoDialog"
                :acao="acao"
                :item="itemEnvio" 
            >
                <v-form>
                    <v-text-field
                        v-model="descricao"
                        label="Descrição"
                        prepend-icon="mdi-text-box-edit"
                        color="green"
                    />
                    <v-text-field
                        v-model="valor"
                        label="Valor"
                        type="number"
                        pattern="\d*"
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
import AlertComponent from './AlertComponent.vue'
import LoadComponent from './LoadComponent.vue'
import RequestMethods from '@/mixins/RequestMethods'
import DialogPersistentComponent from './Field/DialogPersistentComponent.vue'

export default {
    components: { AlertComponent, LoadComponent, DialogPersistentComponent },
    mixins: [GenericMethods, RequestMethods],
    name: 'ServicoComponent',
    data: () =>({
        headers: [
            { text: 'Código', width: "150", value: 'Id', },
            { text: 'Descricao', width: "750", value: 'Descricao', },
            { text: 'Valor', value: 'Valor', align: 'center', },
            { text: 'Ativo', value: 'Ativo', align: 'center', },
            { text: 'Ações', value: 'actions', sortable: false, align: "center" }
        ],
        servicos: [],
        descricao: null,
        ativo: 'Sim',
        valor: null,
        acao: null,
        itemEnvio: null,
        sortBy: 'Id',
        sortDesc: true,
    }),

    methods: {
        novo() {
            this.acao = 'Cadastrar'
            this.descricao = null
            this.valor = null

            this.dialog = !this.dialog
        },

        retornoDialog(retorno) {

            if (retorno.acao == 'Cadastrar' && retorno.success)
                this.requestCadastrarServico()
            else if (retorno.acao == 'Editar' && retorno.success)
                this.requestEditarServico(retorno.response)

            this.dialog = !this.dialog
        },

        requestBuscarServicoPorEmpresaId() {

            this.loader = !this.loader;

            this.servicos = []

            this.RequestGet('Servico/'+this.dadosUsuario.EmpresaId+'/true',
            (retorno) => this.RetornoServico(retorno),
            (error) => this.$emit('response', { success: false, response: error }),
            () => (this.loader = !this.loader))
        },

        RetornoServico(retorno) {
            retorno.data.forEach(element => {
                this.servicos.push({
                        Id: element.id,
                        Descricao: element.descricao,
                        Valor:  'R$ '+parseFloat(element.valor).toFixed(2),
                        Ativo: element.ativo ? 'Sim' : 'Não'
                })
            });
        },

        requestCadastrarServico() {
            debugger
            this.loader = !this.loader;

            this.servicos = []

            this.RequestPost('Servico',
            {
                Descricao: this.descricao,
                EmpresaId: this.dadosUsuario.EmpresaId,
                Valor: this.valor == '' ? '0' : this.valor,
                Ativo: this.ativo == 'Sim'
            },
            (retorno) => {
                this.EnableAlert("Concluido com sucesso.", "success")
            }, 
            (error) => this.RetornoErro(error),
            () => {
                this.loader = !this.loader
                this.requestBuscarServicoPorEmpresaId()
            })

        },

        requestEditarServico(item) {

            debugger
            this.loader = !this.loader;

            this.servicos = []

            this.RequestPut('Servico',
            {
                Id: item.Id,
                Descricao: this.descricao,
                Valor: this.valor == '' ? '0' : this.valor,
                Ativo: this.ativo == 'Sim',
                EmpresaId: this.dadosUsuario.EmpresaId,
            },
            (retorno) => {
                this.EnableAlert("Concluido com sucesso.", "success")
            }, 
            (error) => this.RetornoErro(error),
            () => {
                this.loader = !this.loader
                this.requestBuscarServicoPorEmpresaId()
            })
        },

        deletarServico(item) {

            this.loader = !this.loader;

            this.periodos = []

            this.RequestDelete('Servico/'+item.Id,
            (retorno) => {
                if (retorno.data.dados == null)
                    this.EnableAlert(retorno.data.mensagem, "info")
                else
                    this.EnableAlert("Concluido com sucesso.", "success")
            }, 
            (error) => this.RetornoErro(error),
            () => {
                this.loader = !this.loader
                this.requestBuscarServicoPorEmpresaId()
            })
        },

        editarServico(item) {
            this.acao = 'Editar'
            this.itemEnvio = item
            this.descricao = item.Descricao
            this.valor = item.Valor
            this.ativo = item.Ativo

            this.dialog = !this.dialog
        }
    },

    created() {
        this.requestBuscarServicoPorEmpresaId()
    },

    props: {
        dadosUsuario: Object
    }
}
</script>
<style>
    
</style>