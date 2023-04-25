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
                        :color="item.Avaliacao ? `primary` : `yellow darken-3`"
                        class="mr-3"
                        large
                        @click="avaliarAtendimento(item)"
                        :disabled="item.Status != 'Concluida'"
                    >
                        mdi-star-check
                    </v-icon>
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
                    <td :colspan="headers.length" class="complementar">
                        <div v-if="item.Status != 'Cancelada'">
                            <v-row>
                                Comemoração: {{ item.EhComomoracao }}
                            </v-row>
                            <v-row v-if="item.Servico != null">
                                Serviço: {{ item.Servico }}
                            </v-row>
                            <v-row v-if="item.Observacoes != ''" v-html="item.Observacoes"/>
                        </div>
                        <div v-if="item.Status == 'Cancelada'">
                            Motivo cancelamento: {{ item.DescricaoCancelamento }}
                        </div>
                    </td>
                </template>
            </v-data-table>
            <load-component :Ativo="loader"/>
            <dialog-persistent-component 
                :item="itemEnvio" 
                titulo="Cancelar Reserva" 
                :dialog="dialog" 
                tamanho="400" 
                @response="retornoDialog" 
                :acao="acao"
            >
            <v-text-field
                v-model="motivoCancelamento"
                label="Motivo do Cancelamento"
                prepend-icon="mdi-text-box-edit"
                color="green"
            />
        </dialog-persistent-component>
        <dialog-persistent-component
            titulo="Avalie nosso atendimento"
            :dialog="dialogAvaliacao"
            tamanho="400"
            @response="retornoDialogAvaliacao"
            :item="itemEnvioAvaliacao" 
        >
            <div class="text-center my-5">
                <v-rating
                    v-model="nota"
                    color="yellow darken-3"
                    background-color="grey darken-1"
                    empty-icon="$ratingFull"
                    half-increments
                    hover
                    large
                    prepend-icon="mdi-arrow-right-bold"
                ></v-rating>
            </div>
            <v-textarea
                v-model="descricaoAvaliacao"
                prepend-icon="mdi-message-arrow-right"
                label="Observações"
                color="green"
                counter
            />
        </dialog-persistent-component>
        <dialog-persistent-without-btn-component
            titulo="Avaliação"
            :dialog-new="dialogAvaliacaoView"
            @fechar="close"
            tamanho="400"
        >
            <template v-slot:text>
                <div class="text-center my-5">
                    <v-rating
                        v-model="nota"
                        color="yellow darken-3"
                        background-color="grey darken-1"
                        empty-icon="$ratingFull"
                        half-increments
                        hover
                        large
                        prepend-icon="mdi-arrow-right-bold"
                        readonly
                    ></v-rating>
                </div>
                <v-textarea
                    v-model="descricaoAvaliacao"
                    prepend-icon="mdi-message-arrow-right"
                    label="Observações"
                    color="green"
                    counter
                    disabled
                />
            </template>
        </dialog-persistent-without-btn-component>
        </v-card-text>
    </v-card>
</template>
<script>

import LoadComponent from './LoadComponent.vue';
import AlertComponent from './AlertComponent.vue';
import GenericMethods from '@/mixins/GenericMethods';
import RequestMethods from '@/mixins/RequestMethods';
import DialogPersistentComponent from './Field/DialogPersistentComponent.vue';
import DialogPersistentWithoutBtnComponent from './Field/DialogPersistentWithoutBtnComponent.vue';

export default {
    components: { AlertComponent, LoadComponent, DialogPersistentComponent, DialogPersistentWithoutBtnComponent },

    name: "HistoricoComponent",
    mixins: [GenericMethods, RequestMethods],
    data: () => ({
        itemEnvio: null,
        itemEnvioAvaliacao: null,
        acao: null,
        sortBy: 'Id',
        sortDesc: true,
        search: '',
        headers: [
            { text: 'Codigo', align: 'start', value: 'Id',},
            { text: 'Restaurante', align: 'start', value: 'Empresa', },
            { text: 'Data', value: 'Data', },
            { text: 'Horário/Periodo', value: 'Horario', align: 'center' },
            { text: 'Quantidade Pessoas', value: 'Pessoas', align: 'center' },
            { text: 'Status', value: 'Status', align: 'center' },
            { text: 'Ações', value: 'actions', align: 'center', sortable: false}, 
            { text: '',  value: 'data-table-expand' },
        ],
        historicos: [],
        motivoCancelamento: null,
        dialogAvaliacao: false,
        dialogAvaliacaoView: false,
        descricaoAvaliacao: null,
        nota: 0
    }),

    methods: {
        TempoParaCancelamento(item) {

            let dtHora = this.parseDate(item.Data)+ ' ' +item.Horario

            if(isNaN(Date.parse(dtHora)))
                return false

            let dataReserva = new Date(dtHora)

            let dataLimiteCancel = new Date(dataReserva.getTime())
            dataLimiteCancel.setMinutes(dataReserva.getMinutes() - item.TempoCancelamento)

            let dataAgora = this.currentDate

            if (dataAgora > dataLimiteCancel && dataAgora < dataReserva) {
                this.EnableAlert("Tempo excedido para cancelamento. Tempo permitido " + item.TempoCancelamento + " minutos.", "warning")
                return true
            }

            return false
        },

        cancelarReserva(item) {

            this.motivoCancelamento = null;

            if (item.Status == 'Cancelada') {
                this.EnableAlert("Reserva já cancelada.", "warning")
                return
            } 
            else if (item.Status == 'Concluida') { 
                this.EnableAlert("Reserva não pode ser cancelada.", "warning")
                return
            }
            else if (item.Status == 'Pendente') { 
                this.EnableAlert("Não é permitido cancelar reservas passadas.", "warning")
                return
            }

            if (this.TempoParaCancelamento(item))
                return

            this.acao = "Cancelar"
            this.itemEnvio = item
            this.dialog = !this.dialog
        },

        close(retorno) {
            this.dialogAvaliacaoView = !this.dialogAvaliacaoView
        },

        avaliarAtendimento(item) {
    
            if (item.Avaliacao){
                this.requestBuscarAvaliacao(item)
                this.dialogAvaliacaoView = !this.dialogAvaliacaoView
            }
            else {
                this.itemEnvioAvaliacao = item
                this.descricaoAvaliacao = null
                this.nota = 0
    
                this.dialogAvaliacao = !this.dialogAvaliacao
            }

        },

        retornoDialog(retorno) {

            if (retorno.acao == "Cancelar" && retorno.success) 
                this.requestAlterarStatus(retorno.response.Id, true, this.motivoCancelamento, true)

            this.dialog = !this.dialog
        },

        retornoDialogAvaliacao(retorno) {

            if (retorno.success)
                this.requestAvaliar(this.itemEnvioAvaliacao)

            this.dialogAvaliacao = !this.dialogAvaliacao
        },

        requestAvaliar(item) {
            debugger
            this.loader = !this.loader;

            this.RequestPost('Reserva/Avaliacao',
            {
                ReservaId: item.Id,
                Nota: this.nota,
                Descricao: this.descricaoAvaliacao,
                UsuarioId: this.dadosUsuario.Id,
                EmpresaId: item.EmpresaId
            },
            (response) => this.EnableAlert("Avaliado com sucesso.", "success"),
            (error) => this.RetornoErro(error),
            () => { 
                this.loader = !this.loader 
                
                this.requestReservas()
            })
        },

        requestBuscarAvaliacao(item) {
            
            this.loader = !this.loader;

            this.RequestGet('Reserva/BuscarAvaliacao/'+item.Id,
            (response) => {
                debugger
                this.nota = response.data.nota
                this.descricaoAvaliacao = response.data.descricao
            },
            (error) => this.RetornoErro(error),
            () => this.loader = !this.loader)
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
            (response) => this.EnableAlert("Concluido com sucesso.", "success"),
            (error) => this.RetornoErro(error),
            () => { 
                this.loader = !this.loader 
                
                this.requestReservas()
            })
        },

        requestReservas() {
            this.loader = !this.loader;

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
                    EmpresaId: element.empresaId,
                    Empresa: element.empresa.nome,
                    Data: this.FormatDate(new Date(element.dataReserva).toISOString().substring(0,10)),
                    Horario: element.periodo != null ? element.periodoId + ' - ' + element.periodo.descricao : this.parseTimeDate(element.horario),
                    Servico: element.servico != null ? element.servico.descricao + ' - R$ ' + parseFloat(element.servico.valor).toFixed(2) : null,
                    Pessoas: element.quantidadePessoas,
                    Status: this.RetornoStatus(element),
                    Reservado: element.reservado,
                    EhComomoracao: element.ehComemoracao ? 'Sim' : 'Não',
                    Observacoes: 'Observações: '+ element.descricaoComemoracao.replaceAll('\n', '<br\>'),
                    DescricaoCancelamento: element.motivoCancelamento,
                    TempoCancelamento: element.empresa.empresaAdicional.tempoPermitidoCancelamento,
                    Avaliacao: element.avaliado
                })
                
            });
        }
    },
    created() {
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
<style scoped>
    .complementar {
        padding: 20px !important;
    }
</style>