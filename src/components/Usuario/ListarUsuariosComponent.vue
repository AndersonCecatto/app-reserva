<template>
    <div>
        <alert-component :texto-alerta="textoAlerta" :tipo='tipoAlerta' v-if="alerta == true"/>
        <card-padrao-component>
            <template v-slot:titulo>
                Usuarios
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
                </v-data-table>
            </template>
        </card-padrao-component>
        <dialog-persistent-without-btn-component
            titulo="Cadastro Usuário"
            :dialogNew="dialog"
            tamanho="800"
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
                    color="error"
                    @click="CancelarUsuario()"
                    >
                    <v-icon left>
                        mdi-cancel
                    </v-icon>
                    Cancelar
                </v-btn>
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

export default {
    components: { CardPadraoComponent, DialogPersistentWithoutBtnComponent, CadastroUsuarioComponent, AlertComponent, LoadComponent },
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
        ],
        clientes: [],
        search: '',
        salvarUsuario: false,
        cancelarUsuario: false,
        sortBy: 'Id',
        sortDesc: true,
    }),

    methods: {
        
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

        CancelarUsuario() {
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
    }
}
</script>
<style>
    
</style>