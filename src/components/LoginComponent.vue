<template>
    <div>
        <alert-component :texto-alerta="textoAlerta" :tipo='tipoAlerta' v-if="alerta == true"/>
        <v-container class="text-center">
            <v-row class="text-center">
                <v-col cols="12" 
                    sm="1"
                    xs="1"
                    md="3"
                    />
                <v-col cols="12"
                    md="6"
                    xs="10"
                    sm="10"
                >
                    <v-card
                        elevation="5"
                        class="px-6 top"
                        xs="top-mobile"
                        sm="top-mobile"
                    >
                        <v-card-title >Faça seu Login</v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-form
                                    ref="form" 
                                    lazy-validation
                                >
                                    <v-row class="px-6">
                                        <v-text-field
                                        v-model="usuario"
                                        label="Email"
                                        type="email"
                                        :rules="emailRules"
                                        color="green"
                                        required
                                        prepend-icon="mdi-account-check"
                                        />
                                    </v-row>
                                    <v-row  class="px-6 xs-6">
                                        <v-text-field
                                            v-model="senha"
                                            :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                                            :rules="required"
                                            :type="show1 ? 'text' : 'password'"
                                            label="Senha"
                                            color="green"
                                            counter
                                            required
                                            @click:append="show1 = !show1"
                                            prepend-icon="mdi-lock-check"
                                        ></v-text-field>
                                    </v-row>
                                </v-form>
                                <v-row class="px-6 pt-6">
                                    <v-btn
                                        outlined
                                        large
                                        block
                                        color="green"
                                        @click="requestLogar()"
                                        >
                                        <v-icon left>
                                            mdi-login
                                        </v-icon>
                                        Continuar
                                    </v-btn>
                                </v-row>
                                <v-row class="px-6 pt-6">
                                    <v-label>
                                        Não tenho uma conta
                                    </v-label>
                                    <a href="#"
                                       class="text-decoration-underline pl-2"
                                        @click="dialog = !dialog"
                                       >
                                        Cadastrar-se
                                    </a>
                                </v-row>
                                <v-row>
                                    <v-col >
                                        <!-- lugar que vai os botoes para login Google, Apple -->
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <load-component :Ativo="loader"/>
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
                    Cancelar
                </v-btn>
                <v-btn
                    outlined
                    large
                    color="green"
                    @click="SalvarUsuario()"
                    >
                    Confirmar
                </v-btn>
            </template>
        </dialog-persistent-without-btn-component>
    </div>
</template>
<script>

import LoadComponent from './LoadComponent.vue'
import AlertComponent from './AlertComponent.vue';
import CadastroUsuarioComponent from './Usuario/CadastroUsuarioComponent.vue';
import GenericMethods from '@/mixins/GenericMethods';
import RequestMethods from '@/mixins/RequestMethods';
import DialogPersistentWithoutBtnComponent from './Field/DialogPersistentWithoutBtnComponent.vue';

export default {
    components: { LoadComponent, AlertComponent, CadastroUsuarioComponent, DialogPersistentWithoutBtnComponent },

    name: 'LoginComponent',
    mixins: [GenericMethods, RequestMethods],

    data: () =>({
        alertaUsuario: false,
        textoAlerta: "",
        tipoAlerta: "",
        loader: false,
        senha: "",
        usuario: "",
        show1: false,
        cadastroUsuario: null,
        salvarUsuario: false,
        cancelarUsuario: false,
    }),

    methods: {
        requestLogar() {
            
            if (!this.$refs.form.validate()) 
                return 
            
            this.loader = !this.loader;

            this.RequestPost('Token', 
            {
                'login': this.usuario,
                'senha': this.senha
            }, 
            (retorno) => this.RetornoLogin(retorno), 
            (error) => this.RetornoErro(error),
            () => (this.loader = !this.loader))
        },

        RetornoLogin(response) {

            if (response.data.token == null) {
                this.EnableAlert("Usuário não encontrado.", "warning")
                window.scrollTo(0,0);
                return
            }

            localStorage.setItem('token', response.data.token)

            this.$router.push({ path: '/inicial', name: 'inicial', params: { dadosUsuario: response.data } })
        },

        retornoDialog(retorno) {
            
            this.dialog = !this.dialog
            window.scrollTo(0,0);

            this.EnableAlert("Usuário cadastrado com sucesso.", "success")
        },

        SalvarUsuario() {
            this.salvarUsuario = !this.salvarUsuario
        },

        CancelarUsuario() {
            this.cancelarUsuario = !this.cancelarUsuario

            this.dialog = !this.dialog
        }
       
    },
    props: {
        Ativo: Boolean
    }
}
</script>
<style>
   .top {
    margin-top: 25% !important;
   }

@media only screen and (max-width: 600px) {
        .top {
            margin-top: 55% !important;
        }
    }

    .login {
        background-color: #81C784;
    }
    
</style>