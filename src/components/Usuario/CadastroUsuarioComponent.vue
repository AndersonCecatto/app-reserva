<template>
    <div>
        <v-form
            ref="form" 
            lazy-validation
            class="px-4 mt-3">
            <alert-component :texto-alerta="textoAlerta" :tipo='tipoAlerta' v-if="alerta == true"/>
            <v-text-field
                v-model="localNomeCompleto"
                label="Nome Completo"
                :rules="required"
                color="green"
                required
                prepend-icon="mdi-text-box-edit"
            />
            <v-text-field
                v-model="localTelefone"
                label="Telefone"
                type="tel"
                pattern="\d*"
                required
                color="green"
                :rules="required"
                prepend-icon="mdi-text-box-edit"
                v-mask="maskTelefone"
            />
            <v-text-field
                v-model="localUsuario"
                label="Email"
                type="email"
                :rules="emailRules"
                color="green"
                required
                prepend-icon="mdi-text-box-edit"
            />
            <v-text-field
                v-model="localSenha"
                :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="required"
                :type="show1 ? 'text' : 'password'"
                label="Senha"
                color="green"
                counter
                required
                @click:append="show1 = !show1"
                prepend-icon="mdi-text-box-edit"
            />
            <v-text-field
                v-model="localFuncao"
                label="Função"
                :rules="required"
                color="green"
                required
                prepend-icon="mdi-text-box-edit"
                v-if="dadosUsuario != null && dadosUsuario.Adm"
            />
            <v-select
                v-model="localAtivo"
                :items="items"
                label="Ativo"
                prepend-icon="mdi-list-box"
                color="green"
                :rules="required"
                v-if="dadosUsuario != null && dadosUsuario.Adm"
            />
            <v-select
                v-model="localAdm"
                :items="items"
                label="Administrador"
                prepend-icon="mdi-list-box"
                color="green"
                :rules="required"
                v-if="dadosUsuario != null && dadosUsuario.Adm"
            />
        </v-form>
        <load-component :Ativo="loader"/>
        <dialog-persistent-component
            titulo="Atenção"
            :dialog="dialog"
            tamanho="400"
            @response="retornoDialog"
        >
            <div class="text-h6">
                Seja necessário efetuar o logout para salvar as informações.
            </div>
        </dialog-persistent-component>
    </div>
</template>
<script>

import RequestMethods from '@/mixins/RequestMethods'
import GenericMethods from '@/mixins/GenericMethods'
import AlertComponent from '../AlertComponent.vue'
import LoadComponent from '../LoadComponent.vue'
import DialogPersistentComponent from '../Field/DialogPersistentComponent.vue'

export default {
  components: { AlertComponent, LoadComponent, DialogPersistentComponent },
    name: 'CadastroUsuarioComponent',
    mixins: [RequestMethods, GenericMethods],
    data: () => ({
        localNomeCompleto: null,
        localTelefone: null,
        localUsuario: null,
        localSenha: null,
        localRepetirSenha: null,
        localAtivo: 'Sim',
        localFuncao: null,
        localAdm: 'Não',
        localDadosUsuario: null,
        show1: false,
        items: ['Sim', 'Não'],
    }), 
    methods: {
        retornoDialog(retorno) {
            
            if (retorno.success) {
                this.requisicaoEditar()
            }

            this.dialog = !this.dialog
        },

        limparCampos() {
            if (this.clean) {
                this.localNomeCompleto = null
                this.localUsuario = null
                this.localSenha = null
                this.localTelefone = null
                this.localAtivo = null
                this.localFuncao = null
                this.localAdm = null
            }
        },

        // ValidarCampos() {
        //     if (this.localNomeCompleto == null) return false
        //     if (this.localUsuario == null) return false
        //     if (this.localSenha == null) return false
        //     if (this.localTelefone == null) return false
        // },

        Salvar() {

            if (!this.$refs.form.validate()) 
                return 

            this.loader = !this.loader;

            debugger

            this.RequestPost('Usuario/InserirCliente',
            {
                Nome: this.localNomeCompleto,
                DataCadastro: new Date().toISOString(),
                Login: this.localUsuario,
                Senha: this.localSenha,
                Telefone: this.localTelefone,
                FuncionarioId: this.dadosUsuario?.FuncionarioId,
                EmpresaId: this.dadosUsuario?.EmpresaId,
                Ativo: this.localAtivo == 'Sim' ?? true,
                Funcao: this.localFuncao,
                Administrador: this.localAdm == 'Sim' ?? false,
                Edicao: false
            },
                (retorno) => this.RetornoUsuario(retorno), 
                (error) => this.RetornoErro(error),
                () => (this.loader = !this.loader))
        },

        Editar() {

            if (!this.$refs.form.validate()) 
                return

            this.dialog = !this.dialog
        },

        requisicaoEditar() {

            this.loader = !this.loader;
            debugger

            this.RequestPut('Usuario',
            {
                Id: this.dadosUsuario.Id,
                Nome: this.localNomeCompleto,
                DataCadastro: this.parseDate(this.dadosUsuario.DataCadastro),
                Login: this.localUsuario,
                Senha: this.localSenha,
                Telefone: this.localTelefone,
                FuncionarioId: this.dadosUsuario.FuncionarioId,
                Ativo: this.localAtivo == 'Sim' ?? true,
                Funcao: this.localFuncao,
                Administrador: this.localAdm == 'Sim' ?? false,
                Edicao: true
            },
                (retorno) => this.RetornoEdicao(retorno), 
                (error) => this.RetornoErro(error),
                () => (this.loader = !this.loader))
        },

        RetornoEdicao(retorno) {
            this.$emit('response', { success: retorno, response: this.item, acao: this.acao})
        },

        RetornoUsuario(retorno) {
            this.responseDialog(true)
        },

        responseDialog(retorno) {
            this.limparCampos()
            this.$emit('response', { success: retorno, response: this.item, acao: this.acao})
        },

        atribuirValores(val) {
            
            debugger
            this.localNomeCompleto = val.Nome
            this.localUsuario = val.Login
            this.localSenha = val.Senha
            this.localTelefone = val.Telefone
            this.localAtivo = val.Ativo ?? 'Sim'
            this.localFuncao = val.Funcao
            this.localAdm = val.AdministradorUsuario ?? 'Não'
        }
        
    },
    watch: {
        salvar(newValue) {
            
            if (this.acao == "Editar")
                this.requisicaoEditar()
            else
                this.Salvar()
        },
        cancelar(newValue) {
            this.limparCampos()
        },
        editar(val) {
            this.Editar()
        },
        localDadosUsuario(val) {
            debugger
            if (val != null && this.acao == "Editar")
                this.atribuirValores(val)
        },
        dadosUsuario(val) {
            if (val != null && this.acao == "Editar")
                this.atribuirValores(val)
        }
    },

    created() {
        this.localDadosUsuario = this.dadosUsuario
    },

    props: {
        salvar: Boolean,
        editar: Boolean,
        cancelar: Boolean,
        acao: String,
        clean: Boolean,
        dadosUsuario: Object
    }
}
</script>
<style scoped>
    .v-alert {
        top: 10px !important
    }
</style>