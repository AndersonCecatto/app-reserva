<template>
    <v-card class="pb-3">
        <alert-component :texto-alerta="textoAlerta" :tipo='tipoAlerta' v-if="alerta == true"/>
        <v-card-title>
            Reservas
            <v-spacer></v-spacer>
            <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Pesquisar"
                single-line
                hide-details
                xs="220"
            ></v-text-field>
        </v-card-title>
        
        <v-card-text>
            <v-data-table
                :search="search"
                :headers="headers"
                :items="historicos"
                :footer-props="{
                    'items-per-page-text':'Linhas por pagina',
                    'items-per-page-options': [5, 10, 20, 31]
                }"
                :header-props="{
                    'sortByText': 'Ordenar'
                }"
                :sort-desc.sync="sortDesc"
                :sort-by.sync="sortBy"
                show-expand
                item-key="Id"
            >
                <template v-slot:item.Status="{ item }">
                    <v-chip
                        :color="getColor(item.Status)"
                        dark
                    >
                        {{ item.Status }}
                    </v-chip>
                </template>
                <template v-slot:item.Empresa="{ item }">
                    <td class="font-weight-black">{{ item.Empresa }}</td>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-icon
                        color="error"
                        class="mr-3"
                        large
                        @click="cancelarReserva(item)"
                    >
                        mdi-close-circle
                    </v-icon>
                </template>
                <template v-slot:expanded-item="{ headers, item }">
                    <td :colspan="headers.length" >
                        <div v-if="item.Status != 'Cancelada'">
                            <v-row>
                                Comemoração: {{ item.EhComomoracao }}
                            </v-row>
                            <v-row v-if="item.Observacoes != ''">
                                Observacoes: {{ item.Observacoes }}
                            </v-row>
                        </div>
                        <div v-if="item.Status == 'Cancelada'">
                            Motivo cancelamento: {{ item.DescricaoCancelamento }}
                        </div>
                    </td>
                </template>
            </v-data-table>
            <load-component :Ativo="loader"/>
            <dialog-persistent-component :item="itemEnvio" titulo="Cancelar Reserva" :dialog="dialog" tamanho="400" @response="retornoDialog" :acao="acao">
            <v-text-field
                v-model="motivoCancelamento"
                label="Motivo do Cancelamento"
                prepend-icon="mdi-text-box-edit"
            />
        </dialog-persistent-component>
        </v-card-text>
    </v-card>
</template>
<script>

import LoadComponent from './LoadComponent.vue';
import AlertComponent from './AlertComponent.vue';
import GenericMethods from '@/mixins/GenericMethods';
import RequestMethods from '@/mixins/RequestMethods';
import DialogPersistentComponent from './Field/DialogPersistentComponent.vue';

export default {
    components: { AlertComponent, LoadComponent, DialogPersistentComponent },

    name: "HistoricoComponent",
    mixins: [GenericMethods, RequestMethods],
    data: () => ({
        itemEnvio: null,
        acao: null,
        sortBy: 'Id',
        sortDesc: true,
        search: '',
        headers: [
            { text: 'Codigo', align: 'start', value: 'Id',},
            { text: 'Restaurante', align: 'start', value: 'Empresa', },
            { text: 'Data', value: 'Data', },
            { text: 'Horário/Periodo', value: 'Horario', },
            { text: 'Quantidade Pessoas', value: 'Pessoas', },
            { text: 'Status', value: 'Status', },
            { text: 'Ações', value: 'actions', sortable: false}, 
            { text: '',  value: 'data-table-expand' },
        ],
        historicos: [],
        motivoCancelamento: null,
    }),

    methods: {
        TempoParaCancelamento(item) {

            let dtHora = this.parseDate(item.Data)+ ' ' +item.Horario

            if(isNaN(Date.parse(dtHora)))
                return false

                debugger

            let dataReserva = new Date(dtHora)

            let dataLimiteCancel = new Date(dataReserva.getTime())
            dataLimiteCancel.setMinutes(dataReserva.getMinutes() - item.TempoCancelamento)

            let dataAgora = this.currentDate

            if (dataAgora > dataLimiteCancel && dataAgora < dataReserva) {
                this.EnableAlert("Tempo excedido para cancelamento. Tempo permitido " + item.TempoCancelamento + " minutos.", "warning")
                window.scrollTo(0,0);
                return true
            }
            else if (dataAgora > dataReserva) {
                this.EnableAlert("Não é permitido cancelar reservas passadas.", "warning")
                window.scrollTo(0,0);
                return true
            }

            return false
        },

        cancelarReserva(item) {

            this.motivoCancelamento = null;

            if (item.Status == 'Cancelada') {
                this.EnableAlert("Reserva já cancelada.", "warning")
                window.scrollTo(0,0);
                return
            } 
            else if (item.Status == 'Concluida') { 
                this.EnableAlert("Reserva não pode ser cancelada.", "warning")
                window.scrollTo(0,0);
                return
            }

            if (this.TempoParaCancelamento(item))
                return

            this.acao = "Cancelar"
            this.itemEnvio = item
            this.dialog = !this.dialog
        },

        retornoDialog(retorno) {

            if (retorno.acao == "Cancelar" && retorno.success) 
                this.requestAlterarStatus(retorno.response.Id, true, this.motivoCancelamento, true)

            this.dialog = !this.dialog
        },
        
        requestAlterarStatus(id, cancelar, motivoCancelamento, ativo) {
            this.loader = !this.loader;

            this.RequestPost('Reserva/AlterarStatus',
            {
                id: id,
                Cancelada: cancelar,
                MotivoCancelamento: motivoCancelamento,
                Ativo: ativo
            },
            (response) => this.RetornoAlterarStatus(response),
            (error) => this.RetornoErro(error),
            () => { 
                this.loader = !this.loader 
                
                this.requestReservas()
            })
        },

        RetornoAlterarStatus(response) {
            
            this.EnableAlert("Concluido com sucesso.", "success")
            window.scrollTo(0,0);
            console.log(response)
        },

        requestReservas() {
            this.loader = !this.loader;

            debugger

            let url = this.listaHistoricoEmpresa ?
                    'Reserva/'+this.dadosUsuario.Id+'/'+this.dadosUsuario.EmpresaId :
                    'Reserva/'+this.dadosUsuario.Id+'/'+0

            this.RequestGet(url,
            (retorno) => this.RetornoReservas(retorno),
            (error) => this.RetornoErro(error),
            () => (this.loader = !this.loader))
        },

        RetornoReservas(retorno) {
            
            this.historicos = []
            retorno.data.forEach(element => {
                this.historicos.push({
                    Id: element.id,
                    Empresa: element.empresa.nome,
                    Data: this.FormatDate(new Date(element.dataReserva).toISOString().substring(0,10)),
                    Horario: element.horario == null ? element.periodoId + ' - ' + element.periodo.descricao : this.parseTimeDate(element.horario),
                    Pessoas: element.quantidadePessoas,
                    Status: element.cancelada ? 'Cancelada' : element.ativo ? "Concluida" : "Aguardando",
                    EhComomoracao: element.ehComemoracao ? 'Sim' : 'Não',
                    Observacoes: element.descricaoComemoracao,
                    DescricaoCancelamento: element.motivoCancelamento,
                    TempoCancelamento: element.empresa.empresaAdicional.tempoPermitidoCancelamento
                })
                
            });
        }
    },
    created() {
        debugger
        this.requestReservas()
    },

    watch: {

        refresh (val) {
            this.requestReservas()
        },

        dadosUsuario(val) {
            this.requestReservas()
        }
    },

    props: {
        refresh: Boolean,
        dadosUsuario: Object,
        listaHistoricoEmpresa: Boolean
    }
}
</script>
<style>
    
</style>