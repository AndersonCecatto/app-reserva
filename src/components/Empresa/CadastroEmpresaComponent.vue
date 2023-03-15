<template>
    <v-form 
        ref="form" 
        lazy-validation
        class="px-4 mt-3">
        <v-text-field
            v-model="localRazaoSocial"
            :rules="required"
            label="Razão Social"
            prepend-icon="mdi-text-box-edit"
            color="green"
        />
        <v-text-field
            v-model="localCpfCnpj"
            :rules="required"
            label="Cnpj"
            prepend-icon="mdi-text-box-edit"
            color="green"
            v-mask="maskCnpj"
        />
        <v-text-field
            v-model="localTelefone"
            :rules="required"
            label="Telefone"
            type="phone"
            prepend-icon="mdi-text-box-edit"
            color="green"
            v-mask="maskTelefone"
        />
        <v-text-field
            v-model="localEmail"
            :rules="required"
            label="Email"
            prepend-icon="mdi-text-box-edit"
            color="green"
        />
        <!-- Campo Feito Para Salvar uma foto no banco -->
        <v-file-input
            v-model="localImagem"
            accept="image/*"
            label="Imagem"
            prepend-icon="mdi-camera"
            :value="localImagem"
            @change="onFilePicked"
        />
        <v-text-field
            v-model="localDataCadastro"
            label="Data de Cadastro"
            prepend-icon="mdi-text-box-edit"
            color="green"
            disabled
        />
        <v-row class="px-3 py-7">
            <v-btn
                outlined
                large
                block
                color="green"
                @click="SalvarEmpresa()"
                >
                <v-icon left> mdi-check-bold </v-icon>
                Confirmar
            </v-btn>
        </v-row>
        <load-component :Ativo="loader"/>
    </v-form>
</template>
<script>

import LoadComponent from '../LoadComponent.vue'
import GenericMethods from '@/mixins/GenericMethods';
import RequestMethods from '@/mixins/RequestMethods';

export default {
    components: { LoadComponent },

    name: 'CadastroEmpresaComponent',

    mixins: [GenericMethods, RequestMethods],

    data: () => ({
        localRazaoSocial: null,
        localCpfCnpj: null,
        localTelefone: null,
        localEmail: null,
        localDataCadastro: null,
        localImagem: null,
        imagemName: null,
        imageUrl: null,
    }),
    methods: {
        SalvarEmpresa() {

            if (!this.$refs.form.validate()) 
                return

            this.loader = !this.loader;

            this.RequestPut('Empresa',
            {
                Id: this.dadosUsuario.EmpresaId,
                Nome: this.localRazaoSocial,
                CpfCnpj: this.localCpfCnpj,
                Telefone: this.localTelefone,
                Email: this.localEmail,
                EnderecoId: this.retornoEmpresa.EnderecoId,
                ConfiguracoesEmpresaId: this.retornoEmpresa.ConfiguracoesEmpresaId,
                EmpresaAdicionalId: this.retornoEmpresa.EmpresaAdicionalId,
                DataCadastro: this.parseDate(this.localDataCadastro),
                Imagem: this.imageUrl != null ? window.btoa(this.imageUrl) : null,
                ImagemName: this.imagemName
            },
            (retorno) => {this.$emit('response', { success: true, response: retorno })}, 
            (error) => this.$emit('response', { success: false, response: error }),
            () => (this.loader = !this.loader))
        },

        onFilePicked(e) {
            
            if (e == null) {
                this.imageUrl = null
                this.imagemName = null
                return
            }

            this.imagemName = e.name
            if(this.imagemName.lastIndexOf('.') <= 0) {
                return
            }
            const fr = new FileReader ()
            fr.readAsDataURL(e)
            fr.addEventListener('load', () => {
                this.imageUrl = fr.result
            })
        },
    },
    watch: {
        retornoEmpresa(val) {
            
            this.localDataCadastro = this.FormatDate(new Date(val.DataCadastroEmpresa).toISOString().substring(0,10))
            this.localRazaoSocial = val.RazaoSocial
            this.localCpfCnpj = val.Cnpj
            this.localTelefone = val.Telefone
            this.localEmail = val.Email

            if (val.ImagemName == null)
                return

            this.localImagem = new File([''], val.ImagemName, {
                type: "text/plain",
            })

            this.imagemName = val.ImagemName
        }
    },

    // created() {
    //     debugger
    //     if (this.RetornoDadosEmpresa.NameImagem == null)
    //         return

    //     this.localImagem = new File([this.RetornoDadosEmpresa.NameImagem], this.RetornoDadosEmpresa.NameImagem, {
    //         type: "text/plain",
    //     })

    //     this.imagemName = this.RetornoDadosEmpresa.NameImagem
    // },

    props: {
        razaoSocial: String,
        cnpj: String,
        telefone: String,
        email: String,
        //enderecoId: Number,
        //configuracoesEmpresaId: Number,
        dataCadastro: String,
        //empresaAdicionalId: Number,
        NameImagem: String,
        dadosUsuario: Object,
        retornoEmpresa: Object
    }
}
</script>
<style>
    
</style>