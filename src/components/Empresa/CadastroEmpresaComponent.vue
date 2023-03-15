<template>
    <v-form class="px-4 mt-3">
        <v-text-field
            v-model="localRazaoSocial"
            label="Razão Social"
            prepend-icon="mdi-text-box-edit"
            color="green"
        />
        <v-text-field
            v-model="localCpfCnpj"
            label="Cnpj"
            prepend-icon="mdi-text-box-edit"
            color="green"
        />
        <v-text-field
            v-model="localTelefone"
            label="Telefone"
            type="phone"
            prepend-icon="mdi-text-box-edit"
            color="green"
        />
        <v-text-field
            v-model="localEmail"
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
        localRazaoSocial: '',
        localCpfCnpj: '',
        localTelefone: '',
        localEmail: '',
        localEnderecoId: '',
        localConfiguracoesmpresaId: '',
        localDataCadastro: '',
        localImagem: null,
        imageName: null,
        imageUrl: null,
    }),
    methods: {
        SalvarEmpresa() {
            this.loader = !this.loader;

            this.RequestPut('Empresa',
            {
                Id: this.dadosUsuario.EmpresaId,
                Nome: this.localRazaoSocial,
                CpfCnpj: this.localCpfCnpj,
                Telefone: this.localTelefone,
                Email: this.localEmail,
                EnderecoId: this.localEnderecoId,
                ConfiguracoesEmpresaId: this.localConfiguracoesmpresaId,
                EmpresaAdicionalId: this.empresaAdicionalId,
                DataCadastro: this.parseDate(this.localDataCadastro),
                Imagem: this.imageUrl != null ? window.btoa(this.imageUrl) : null,
                ImagemName: this.imageName
            },
            (retorno) => {this.$emit('response', { success: true, response: retorno })}, 
            (error) => this.$emit('response', { success: false, response: error }),
            () => (this.loader = !this.loader))
        },

        onFilePicked(e) {
            
            debugger

            if (e != null) {

                this.imageName = e.name
                if(this.imageName.lastIndexOf('.') <= 0) {
                    return
                }
                const fr = new FileReader ()
                fr.readAsDataURL(e)
                fr.addEventListener('load', () => {
                    this.imageUrl = fr.result
                })
            }

            this.imageUrl = null
            this.ImageName = null
        }
    },
    watch: {
        razaoSocial(val) {
            this.localRazaoSocial = val
        },
        cnpj(val) {
            this.localCpfCnpj = val
        },
        telefone(val) {
            this.localTelefone = val
        },
        email(val) {
            this.localEmail = val
        },
        enderecoId(val) {
            this.localEnderecoId = val
        },
        configuracoesEmpresaId(val) {
            this.localConfiguracoesmpresaId = val
        },
        dataCadastro(val) {
            this.localDataCadastro = this.FormatDate(new Date(val).toISOString().substring(0,10))
        },
        imagemName(val) {
            this.localImagem = new File([val], val, {
                  type: "text/plain",
            })

            this.imageName = val
        }
    },
    props: {
        razaoSocial: String,
        cnpj: String,
        telefone: String,
        email: String,
        enderecoId: Number,
        configuracoesEmpresaId: Number,
        dataCadastro: String,
        empresaAdicionalId: Number,
        imagemName: String,
        dadosUsuario: Object
    }
}
</script>
<style>
    
</style>