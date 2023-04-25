<template>
    <v-app id="inspire">
        <v-navigation-drawer
            v-model="drawer"
            app
            color="green lighten-4"
        >
            <v-container>
                <v-list-item>
                    <v-list-item-avatar>
                        <v-icon size="36" @click="AcessarEditarUsuario()">mdi-account-circle</v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content>
                    <v-list-item-title>{{dadosUsuario.Id}} - {{dadosUsuario.Nome}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider>

                <v-list dense>
                    <v-list-item-group
                        v-model="list"
                    >
                        <v-list-item
                        v-for="item in menus"
                        :key="item.title"
                        link
                        @click="AcessarLink(item)"
                        >
                            <v-list-item-icon>
                                <v-icon>{{ item.icon }}</v-icon>
                            </v-list-item-icon>

                            <v-list-item-content>
                                <v-list-item-title>{{ item.title }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-container>
        </v-navigation-drawer>

        <v-app-bar app color="green lighten-4">
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

        <v-toolbar-title>
            My Reserva
        </v-toolbar-title>
        <v-spacer/>

        <v-icon
            medium
            @click="refresh = !refresh"
        >
            mdi-reload
        </v-icon>

        </v-app-bar>

        <v-main>
            <empresas-component v-if="empresaComponent" @dadosEmpresa="RetornoEmpresa" :refresh="refresh" :dadosUsuario="this.dadosUsuario"/>
            <agendar-component v-if="agendaComponent" :dadosEmpresa="dadosEmpresa" :dadosUsuario="this.dadosUsuario" @reservado="retornoReserva"/>
            <historico-cliente-component v-if="historicoClienteComponent" :dadosUsuario="this.dadosUsuario" :refresh="refresh"/>
            <configuracoes-empresa-component v-if="configuracoesEmpresaComponent" :refresh="refresh" :dadosUsuario="this.dadosUsuario"/>
            
            <inicial-empresa-component :dadosUsuario="this.dadosUsuario"  v-if="inicialEmpresaComponent" :refresh="refresh"/>
            <editar-usuario-component v-if="editarUsuarioComponent" :dadosUsuario="this.dadosUsuario"/>
            <listar-usuarios-component v-if="cadastroUsuarioComponent" :recebe-dados-usuario="this.dadosUsuario"/>
            <listar-funcionarios-component v-if="listarFuncionariosComponent" :dadosUsuario="this.dadosUsuario" />
            <cadastro-periodo-component :dadosUsuario="this.dadosUsuario" v-if="cadastroPeriodoComponent" />
            <servico-component :dadosUsuario="this.dadosUsuario" v-if="servicoComponent" />
        </v-main>

        <load-component :Ativo="loader"/>
    </v-app>
</template>

<script>

import GenericMethods from '@/mixins/GenericMethods'
import AgendarComponent from './AgendarComponent.vue'
import ConfiguracoesEmpresaComponent from './ConfiguracoesEmpresaComponent.vue'
import EmpresasComponent from './EmpresasComponent.vue'
import HistoricoClienteComponent from './HistoricoClienteComponent.vue'
import LoadComponent from './LoadComponent.vue'
import InicialEmpresaComponent from './TelaInicial/InicialEmpresaComponent.vue'
import CardPadraoComponent from './Field/CardPadraoComponent.vue'
import ListarUsuariosComponent from './Usuario/ListarUsuariosComponent.vue'
import jwt_decode from "jwt-decode";
import EditarUsuarioComponent from './Usuario/EditarUsuarioComponent.vue'
import ListarFuncionariosComponent from './Usuario/ListarFuncionariosComponent.vue'
import CadastroPeriodoComponent from './Empresa/CadastroPeriodoComponent.vue'
import ServicoComponent from './ServicoComponent.vue'

export default {
    components: { 
        EmpresasComponent, 
        AgendarComponent, 
        HistoricoClienteComponent, 
        ConfiguracoesEmpresaComponent, 
        InicialEmpresaComponent,
        LoadComponent,
        CardPadraoComponent,
        ListarUsuariosComponent,
        EditarUsuarioComponent,
        ListarFuncionariosComponent,
        CadastroPeriodoComponent,
        ServicoComponent
    },

    name: "InicialComponent",
    mixins: [GenericMethods],
    data: () => ({
        dadosEmpresa: null,
        empresaComponent: false,
        agendaComponent: false,
        historicoClienteComponent: false,
        configuracoesEmpresaComponent: false,
        inicialEmpresaComponent: false,
        cadastroUsuarioComponent: false,
        listarFuncionariosComponent: false,
        editarUsuarioComponent: false,
        cadastroPeriodoComponent: false,
        servicoComponent: false,

        list: null,
        drawer: null,
        refresh: false,
        dadosUsuario: {},
        menusCliente: [
            { Id: 1, title: 'Home', icon: 'mdi-home' },
            { Id: 2, title: 'Histórico', icon: 'mdi-history' },
            { Id: 8, title: 'Sair', icon: 'mdi-logout' },
        ],
        menusEmpresa: [
            { Id: 1, title: 'Home', icon: 'mdi-home' },
            { Id: 2, title: 'Reservas', icon: 'mdi-history' },
            { Id: 3, title: 'Empresa', icon: 'mdi-domain' },
            { Id: 4, title: 'Usuarios', icon: 'mdi-account-group' },
            { Id: 5, title: 'Periodos', icon: 'mdi-clipboard-text-clock' },
            { Id: 6, title: 'Servicos', icon: 'mdi-offer' },
            { Id: 7, title: 'Funcionarios', icon: 'mdi-badge-account' },
            { Id: 8, title: 'Sair', icon: 'mdi-logout' },
        ],
        menusFuncionario: [
            { Id: 1, title: 'Home', icon: 'mdi-home' },
            { Id: 2, title: 'Reservas', icon: 'mdi-history' },
            { Id: 4, title: 'Usuarios', icon: 'mdi-account-circle' },
            { Id: 8, title: 'Sair', icon: 'mdi-logout' },
        ]
    }),
    methods: {

        drawerPhone() {
            if (this.$vuetify.breakpoint.name === "xs") {
                this.drawer = !this.drawer
            }
        },

        retornoReserva(reservado) {
            setTimeout(() => {
                if (this.dadosUsuario.EmpresaId == '') {
                    this.agendaComponent = false
                    this.historicoClienteComponent = true
                }
                else 
                {
                    this.agendaComponent = false
                    this.inicialEmpresaComponent = true
                }
            }, 600)
        },

        DesabilitarComponentes() {
            this.empresaComponent = false,
            this.historicoClienteComponent = false,
            this.agendaComponent = false,
            this.configuracoesEmpresaComponent = false
            this.cadastroUsuarioComponent = false
            this.inicialEmpresaComponent = false
            this.editarUsuarioComponent = false
            this.listarFuncionariosComponent = false
            this.cadastroPeriodoComponent = false
            this.servicoComponent = false
        },
        AcessarLink(item){
            this.DesabilitarComponentes()
            
            if (item.Id == 1)
                this.empresaComponent = true
            else if (item.Id == 2) {
                if (this.dadosUsuario.EmpresaId != ''){
                    this.inicialEmpresaComponent = true
                }
                else {
                    this.historicoClienteComponent = true
                }
            }
            else if (item.Id == 3)
                this.configuracoesEmpresaComponent = true
            else if (item.Id == 4)
                this.cadastroUsuarioComponent = true
            else if (item.Id == 5)
                this.cadastroPeriodoComponent = true
            else if (item.Id == 6)
                this.servicoComponent = true
            else if (item.Id == 7)
                this.listarFuncionariosComponent = true
            else if (item.Id == 8) {
                
                this.loader = !this.loader;

                setTimeout(() => {
                    localStorage.setItem('token', null)
                    this.$router.push('/')
                    
                    this.loader = !this.loader;
                }, 900)
            }
        },

        AcessarEditarUsuario() {
            this.DesabilitarComponentes()

            this.editarUsuarioComponent = true
            this.drawerPhone()
        },

        TelasIniciais() {
            
            if (this.dadosUsuario.EmpresaId != '' && this.dadosUsuario.Adm == 'True') {
                this.inicialEmpresaComponent = true
                this.menus = this.menusEmpresa
            }
            else if (this.dadosUsuario.EmpresaId != '') {
                this.inicialEmpresaComponent = true
                this.menus = this.menusFuncionario
            }
            else {
                this.empresaComponent = true
                this.menus = this.menusCliente
            }
        },

        RetornoEmpresa(empresa) {
            this.DesabilitarComponentes()
            this.dadosEmpresa = empresa
            this.agendaComponent = true
        },
    },

    created() {
        this.dadosUsuario = jwt_decode(localStorage.getItem('token'))

        this.TelasIniciais()
    },

    watch: {
        list() {
            if (this.$vuetify.breakpoint.name === "xs" ||
                this.$vuetify.breakpoint.name === "md") {
                this.drawer = !this.drawer
            }
        }
    }
}
</script>
<style scoped>
    .v-main {
        padding: 15px 15px !important;
    }
</style>