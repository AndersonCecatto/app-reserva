<template>
    <div>
        <alert-component :texto-alerta="textoAlerta" :tipo='tipoAlerta' v-if="alerta == true"/>
        <card-padrao-component>
            <template v-slot:titulo>
                Usuario
            </template>
            <template v-slot:texto>
                <cadastro-usuario-component
                    :editar="editar"
                    :clean="true"
                    :dadosUsuario="dadosEdicaoUsuario"
                    acao="Editar"
                    @response="retornoDialog"
                />
                <v-row class="px-7 pt-7 text-center">
                <v-btn
                    outlined
                    large
                    block
                    color="green"
                    @click="Editar()"
                    >
                    Confirmar
                </v-btn>
            </v-row>
            </template>
        </card-padrao-component>
        <load-component :Ativo="loader"/>
    </div>
</template>
<script>

import GenericMethods from '@/mixins/GenericMethods'
import CardPadraoComponent from '../Field/CardPadraoComponent.vue'
import RequestMethods from '@/mixins/RequestMethods'
import CadastroUsuarioComponent from './CadastroUsuarioComponent.vue'
import LoadComponent from '../LoadComponent.vue'
import AlertComponent from '../AlertComponent.vue'

export default {
  components: { CardPadraoComponent, CadastroUsuarioComponent, LoadComponent, AlertComponent },
    name: 'EditarUsuarioComponent',

    data: () => ({
        dadosEdicaoUsuario: null,
        editar: false
    }),

    mixins: [GenericMethods, RequestMethods],

    methods: {

        Editar() {
            this.editar = !this.editar
        },
        
        retornoDialog(retorno) {
            
            this.dialog = !this.dialog

            this.EnableAlert("Usuário Editado com sucesso.", "success")
            
            this.loader = !this.loader;

            setTimeout(() => {
                localStorage.setItem('token', null)
                this.$router.push('/')
                
                this.loader = !this.loader;
            }, 900)
        },

        requestUsuarioPorId() {

            this.loader = !this.loader;

            this.RequestGet('Usuario/GetById/'+this.dadosUsuario.Id,
            (retorno) => this.RetornoUsuarioPorId(retorno), 
            (error) => this.RetornoErro(error),
            () => (this.loader = !this.loader))
        },

        RetornoUsuarioPorId(retorno) {
            
            debugger

            this.dadosEdicaoUsuario = {
                Id: retorno.data.id,
                Nome: retorno.data.nome,
                DataCadastro: this.FormatDate(new Date(retorno.data.dataCadastro).toISOString().substring(0,10)),
                Telefone: retorno.data.telefone,
                Login: retorno.data.login,
                Senha: retorno.data.senha,
                EmpresaId : retorno.data.empresaId,
                FuncionarioId: retorno.data.funcionarioId,
                Funcao: retorno.data.funcionario?.funcao,
                Ativo: retorno.data.ativo ? 'Sim' : 'Não',
                AdministradorUsuario: retorno.data.funcionario?.administrador != null ? retorno.data.funcionario.administrador ? 'Sim' : 'Não' : null,
                Adm: retorno.data.funcionario?.administrador ?? false
            }
        },
    },

    created() {
        this.requestUsuarioPorId()
    },

    props: {
        dadosUsuario: Object
    }
}
</script>
<style>
    
</style>