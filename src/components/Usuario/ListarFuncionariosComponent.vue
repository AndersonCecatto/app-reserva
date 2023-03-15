<template>
    <div>
        <alert-component :texto-alerta="textoAlerta" :tipo='tipoAlerta' v-if="alerta == true"/>
        <card-padrao-component>
            <template v-slot:titulo>
                <div class="mr-3">Funcionarios</div>
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
                    @click="dialog = !dialog, acao = 'novo', dadosEdicaoUsuario = dadosUsuario"
                    >
                    Novo
                </v-btn>
            </template>
            <template v-slot:texto>
                <v-data-table
                    :headers="headers"
                    :items="funcionarios"
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
                            midium
                            class="mr-3"
                            @click="editarFuncionario(item)"
                        >
                            mdi-pencil
                        </v-icon>
                    </template>
                </v-data-table>
            </template>
        </card-padrao-component>
        <dialog-persistent-without-btn-component
            titulo="Cadastro Funcionario"
            :dialogNew="dialog"
            tamanho="800"
        >
            <template v-slot:text>
                <cadastro-usuario-component
                    :salvar="salvarFuncionario"
                    :cancelar="cancelarFuncionario"
                    :clean="true"
                    :dados-usuario="dadosEdicaoUsuario"
                    :acao="acao"
                    @response="retornoDialog"
                />
            </template>
            <template v-slot:actions>
                <v-spacer/>
                <v-btn
                    outlined
                    large
                    color="error"
                    @click="CancelarFuncionario()"
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
                    @click="SalvarFuncionario()"
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
import AlertComponent from '../AlertComponent.vue'
import CardPadraoComponent from '../Field/CardPadraoComponent.vue'
import RequestMethods from '@/mixins/RequestMethods'
import DialogPersistentWithoutBtnComponent from '../Field/DialogPersistentWithoutBtnComponent.vue'
import CadastroUsuarioComponent from './CadastroUsuarioComponent.vue'
import LoadComponent from '../LoadComponent.vue'

export default {
    components: { AlertComponent, CardPadraoComponent, DialogPersistentWithoutBtnComponent, CadastroUsuarioComponent, LoadComponent },
    name: 'ListarFuncionariosComponent',
    mixins: [GenericMethods, RequestMethods],
    data: () => ({
        headers: [
            { text: 'Codigo', value: 'Id' },
            { text: 'Nome', value: 'Nome' },
            { text: 'Telefone', value: 'Telefone' },
            { text: 'Login', value: 'Login' },
            { text: 'Senha', value: 'Senha' },
            { text: 'Função', value: 'Funcao' },
            { text: 'Administrador', value: 'Adm' },
            { text: 'Ativo', value: 'Ativo' },
            { text: 'Ações', value: 'actions', sortable: false },
        ],
        funcionarios: [],
        sortBy: 'Id',
        sortDesc: true,
        salvarFuncionario: false,
        cancelarFuncionario: false,
        dadosEdicaoUsuario: null,
        acao: null
    }),

    methods: {

        requestFuncionarios() {

            this.loader = !this.loader;

            this.RequestGet('Usuario/Funcionarios/'+this.dadosUsuario.EmpresaId,
            (retorno) => this.RetornoFuncionarios(retorno), 
            (error) => this.RetornoErro(error),
            () => (this.loader = !this.loader))
        },

        RetornoFuncionarios(retorno) {
            this.funcionarios = []
            retorno.data.forEach(element => {
                this.funcionarios.push({
                    Id: element.id,
                    Nome: element.nome,
                    DataCadastro: this.FormatDate(new Date(element.dataCadastro).toISOString().substring(0,10)),
                    Login: element.login,
                    Senha: element.senha,
                    Telefone: element.telefone,
                    FuncionarioId: element.funcionario.id,
                    Funcao: element.funcionario.funcao,
                    Ativo: element.ativo ? 'Sim' : 'Não',
                    Adm: element.funcionario.administrador ? 'Sim' : 'Não'
                })
            })
        },

        SalvarFuncionario() {
            this.salvarFuncionario = !this.salvarFuncionario
        },

        CancelarFuncionario() {
            this.cancelarFuncionario = !this.cancelarFuncionario

            this.dialog = !this.dialog
        },

        retornoDialog(retorno) {
            this.dialog = !this.dialog

            this.EnableAlert("Funcionário cadastrado com sucesso.", "success")
            this.requestFuncionarios()
        },

        editarFuncionario(item) {
            
            this.dialog = !this.dialog

            this.dadosEdicaoUsuario = {}

            this.dadosEdicaoUsuario = {
                Id: item.Id,
                Nome: item.Nome,
                DataCadastro: item.DataCadastro,
                Telefone: item.Telefone,
                Login: item.Login,
                Senha: item.Senha,
                FuncionarioId: item.FuncionarioId,
                Funcao: item.Funcao,
                Ativo: item.Ativo,
                AdministradorUsuario: item.Adm,
                Adm: true
            }

            this.acao = 'Editar'
        }
    },

    created() {
        this.requestFuncionarios()
    },

    props: {
        dadosUsuario: Object
    }
}
</script>
<style>
    
</style>