<template>
    <div>
        <alert-component :texto-alerta="textoAlerta" :tipo='tipoAlerta' v-if="alerta == true"/>
        <card-padrao-component>
            <template v-slot:titulo>
                <div class="mr-3">Usuarios</div>
                <v-spacer></v-spacer>
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Pesquisar"
                    single-line
                    hide-details
                ></v-text-field>
                <v-spacer></v-spacer>
                <v-btn
                    class="mr-3"
                    outlined
                    large
                    right
                    color="primary"
                    @click="dialog = !dialog"
                    >
                    Novo
                </v-btn>
            </template>
            <template v-slot:texto>
                <v-data-table
                    :headers="headers"
                    :items="clientes"
                    :search="search"
                    :footer-props="{
                        'items-per-page-text':'Linhas por pagina',
                        'items-per-page-options': [5, 10, 20, 50]
                    }"
                    :header-props="{
                        'sortByText': 'Ordenar'
                    }"
                    :sort-desc.sync="sortDesc"
                    :sort-by.sync="sortBy"
                >
                    <template v-slot:item.Nome="{ item }">
                        <td class="font-weight-black">{{ item.Nome }}</td>
                    </template>
                    <template v-slot:item.Login="{ item }">
                        <td class="font-weight-black">{{ item.Login }}</td>
                    </template>
                    <template v-slot:item.actions="{ item }">
                        <v-icon
                            color="primary"
                            class="mr-3"
                            large
                            @click="Historico(item)"
                        >
                            mdi-history
                        </v-icon>
                    </template>
                </v-data-table>
            </template>
        </card-padrao-component>
        <dialog-persistent-without-btn-component
            titulo="Cadastro Usuário"
            :dialogNew="dialog"
            tamanho="800"
            @fechar="CancelarUsuario"
        >
            <template v-slot:text>
                <cadastro-usuario-component
                    :salvar="salvarUsuario"
                    :cancelar="cancelarUsuario"
                    :clean="true"
                    @response="retornoDialog"
                />
            </template>
            <template v-slot:actions>
                <v-spacer/>
                <v-btn
                    outlined
                    large
                    color="green"
                    @click="SalvarUsuario()"
                    >
                    <v-icon left>
                        mdi-check
                    </v-icon>
                    Confirmar
                </v-btn>
            </template>
        </dialog-persistent-without-btn-component>

        <dialog-persistent-without-btn-component
            :dialogNew="dialogHistorico"
            tamanho="800"
            @fechar="close"
        >
            <template v-slot:text>
                <historico-cliente-component :dados-usuario="dadosUsuario" :lista-historico-empresa="true"/>
            </template>
        </dialog-persistent-without-btn-component>
        <load-component :Ativo="loader"/>
    </div>
</template>
<script>

import GenericMethods from '@/mixins/GenericMethods'
import CardPadraoComponent from '../Field/CardPadraoComponent.vue'
import RequestMethods from '@/mixins/RequestMethods'
import DialogPersistentWithoutBtnComponent from '../Field/DialogPersistentWithoutBtnComponent.vue'
import CadastroUsuarioComponent from './CadastroUsuarioComponent.vue'
import AlertComponent from '../AlertComponent.vue'
import LoadComponent from '../LoadComponent.vue'
import HistoricoClienteComponent from '../HistoricoClienteComponent.vue'

export default {
    components: { CardPadraoComponent, DialogPersistentWithoutBtnComponent, CadastroUsuarioComponent, AlertComponent, LoadComponent, HistoricoClienteComponent },
    mixins: [GenericMethods, RequestMethods],
    name: 'ListaUsuariosComponent',

    data: () => ({
        headers: [ 
            { text: 'Codigo', value: 'Id' },
            { text: 'Nome', value: 'Nome' },
            { text: 'Telefone', value: 'Telefone' },
            { text: 'Data Cadastro', value: 'DataCadastro' },
            { text: 'Login', value: 'Login' },
            { text: 'Ativo', value: 'Ativo' },
            { text: 'Ações', value: 'actions', sortable: false },
        ],
        clientes: [],
        search: '',
        salvarUsuario: false,
        cancelarUsuario: false,
        sortBy: 'Id',
        sortDesc: true,
        dialogHistorico: false,
        dadosUsuario: null,
    }),

    methods: {

        Historico(item) {

            this.dadosUsuario = {
                Id: item.Id,
                EmpresaId: this.recebeDadosUsuario?.EmpresaId
            }

            this.dialogHistorico = !this.dialogHistorico
        },

        close(retorno) {
            this.dialogHistorico = retorno
        },
        
        requestUsuarios() {

            this.loader = !this.loader;

            this.RequestGet('Usuario/Clientes',
            (retorno) => this.RetornoUsuarios(retorno), 
            (error) => this.RetornoErro(error),
            () => (this.loader = !this.loader))
        },

        RetornoUsuarios(retorno) {
            this.clientes = []
            retorno.data.forEach(element => {
                this.clientes.push({
                    Id: element.id,
                    Nome: element.nome,
                    Telefone: element.telefone,
                    DataCadastro: this.FormatDate(new Date(element.dataCadastro).toISOString().substring(0,10)),
                    Login: element.login,
                    Ativo: element.ativo == true ? 'Sim' : 'Não'
                })
            })
        },

        SalvarUsuario() {
            this.salvarUsuario = !this.salvarUsuario
        },

        CancelarUsuario(retorno) {
            this.cancelarUsuario = !this.cancelarUsuario

            this.dialog = !this.dialog
        },

        retornoDialog(retorno) {
            this.dialog = !this.dialog

            this.EnableAlert("Usuário cadastrado com sucesso.", "success")
            this.requestUsuarios()
        },
    },

    created() {
        this.requestUsuarios()
    },

    props: {
        recebeDadosUsuario: Object
    }
}
</script>
<style>
    
</style>