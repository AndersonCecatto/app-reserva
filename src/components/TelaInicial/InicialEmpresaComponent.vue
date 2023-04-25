<template>
    <v-card class="pb-4">
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
            ></v-text-field>
            <v-menu
                bottom
                left
            >
                <template v-slot:activator="{ on, attrs }">
                <v-btn
                    icon
                    v-bind="attrs"
                    v-on="on"
                    class="ml-5"
                >
                    <v-icon>mdi-filter-variant</v-icon>
                </v-btn>
                </template>
                <v-list>
                    <v-list-item-group
                        v-model="selectedItem"
                        color="primary"
                    >
                        <v-list-item
                            v-for="(item, i) in menus"
                            :key="i"
                            @click="filtro(item)"
                        >
                        <v-list-item-icon>
                            <v-icon v-text="item.icon"></v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                        </v-list-item-content>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
          </v-menu>
        </v-card-title>
        <v-row v-if="hideFilterDate == true">
            <v-col 
                cols="6"
                sm="3"
                md="3"
                class="ml-5"
            >
                <data-dialog-field-component
                    @retornoData="aplicarFiltroDataInicial"
                    titulo="Data Inicial"
                />
            </v-col>
            <v-col 
                cols="6"
                sm="3"
                md="3"
                class="ml-5"
            >
                <data-dialog-field-component
                    @retornoData="aplicarFiltroDataFinal"
                    titulo="Data Final"
                />
            </v-col>
            <v-icon
                class="mx-5"
                large
                @click="aplicarFiltroData()"
            >
                mdi-check-circle
            </v-icon>
            <v-icon
                large
                @click="deletarFiltroData()"
            >
                mdi-close-circle
            </v-icon>
        </v-row>
        <v-data-table
            :search="search"
            :headers="headers"
            :items="ReservasView"
            :footer-props="{
                'items-per-page-text':'Linhas por pagina',
                'items-per-page-options': [5, 10, 20, 31]
            }"
            :header-props="{
                'sortByText': 'Ordenar'
            }"
            :sort-desc.sync="sortDesc"
            :sort-by.sync="sortBy"
            :single-expand="singleExpand"
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
            <template v-slot:item.Usuario="{ item }">
                <td class="font-weight-black">{{ item.Usuario }}</td>
            </template>
            <template v-slot:item.actions="{ item }">
                <v-icon
                    color="primary"
                    class="mr-3"
                    large
                    @click="avaliarAtendimento(item)"
                    :disabled="!item.Avaliacao"
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
                <v-icon
                    color="success"
                    class="ml-3"
                    large
                    @click="aceitarReserva(item)"
                >
                    mdi-check-circle
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
    </v-card>
</template>
<script>

import LoadComponent from '../LoadComponent.vue';
import GenericMethods from '@/mixins/GenericMethods';
import DialogPersistentComponent from '../Field/DialogPersistentComponent.vue';
import AlertComponent from '../AlertComponent.vue';
import RequestMethods from '@/mixins/RequestMethods';
import DataDialogFieldComponent from '../Field/DataDialogFieldComponent.vue';
import DialogPersistentWithoutBtnComponent from '../Field/DialogPersistentWithoutBtnComponent.vue';

export default {
  components: { LoadComponent, DialogPersistentComponent, AlertComponent, DataDialogFieldComponent, DialogPersistentWithoutBtnComponent },

    name: 'InicialEmpresaComponent',
    mixins: [GenericMethods, RequestMethods],
    data: (vm) => ({
        singleExpand: false,
        itemEnvio: null,
        motivoCancelamento: null,
        acao: null,
        dialog: false,
        loader: false,
        sortBy: 'Id',
        sortDesc: true,
        search: '',
        menu: false,
        selectedItem: 1,
        hideFilterDate: false,
        dataInicial: vm.FormatDate(new Date().toISOString().substring(0, 10)),
        dataFinal: vm.FormatDate(new Date().toISOString().substring(0, 10)),
        dialogAvaliacaoView: false,
        nota: 0,
        descricaoAvaliacao: null,
        menus: [ 
            { id: 1, title: 'Data', icon: 'mdi-calendar-range' }
        ],
        headers: [
            { text: 'Código', value: 'Id' },
            { text: 'Usuario', align: 'start', value: 'Usuario', },
            { text: 'Data', value: 'Data', },
            { text: 'Horário/Periodo', value: 'Horario', },
            { text: 'Quantidade Pessoas', value: 'Pessoas', },
            { text: 'Status', value: 'Status', },
            { text: 'Ações', value: 'actions', sortable: false },
            { text: '',  value: 'data-table-expand' },
        ],
        Reservas: [],
        ReservasView: [],
    }),

    methods: {
        cancelarReserva(item) {
            this.motivoCancelamento = null;

            if (item.Status == 'Cancelada') {
                this.EnableAlert("Reserva já cancelada.", "warning")
                return
            } 

            this.acao = "Cancelar"
            this.itemEnvio = item
            this.dialog = !this.dialog
        },
        requestAlterarStatus(id, cancelar, motivoCancelamento, ativo, reservado) {

            this.loader = !this.loader;

            this.RequestPost('Reserva/AlterarStatus',
            {
                id: id,
                Cancelada: cancelar,
                MotivoCancelamento: motivoCancelamento,
                Ativo: ativo,
                Reservado: reservado,
                UsuarioCancelamentoId: this.dadosUsuario.Id,
            },
            () => this.EnableAlert("Concluido com sucesso.", "success"),
            (error) => this.RetornoErro(error),
            () => {
                this.loader = !this.loader
                this.requestBuscarPorEmpresaId()
            })
        },
        aceitarReserva(item) {

            if (item.Status == 'Concluida') {
                this.EnableAlert("Reserva já concluida.", "warning")
                return
            }
            else if (item.Status == 'Cancelada') {
                this.EnableAlert("Reserva já cancelada.", "warning")
                return
            }

            if (item.Status == 'Aguardando')
                this.requestAlterarStatus(item.Id, false, null, false, true)
            else
                this.requestAlterarStatus(item.Id, false, null, true, true)
        },
        retornoDialog(retorno) {

            if (retorno.acao == "Cancelar" && retorno.success) 
                this.requestAlterarStatus(retorno.response.Id, true, this.motivoCancelamento, true)

            this.dialog = !this.dialog
        },
        requestBuscarPorEmpresaId() {
            this.loader = !this.loader;
            
            this.RequestGet('Reserva/BuscarPorEmpresaId/'+this.dadosUsuario.EmpresaId,
            (response) => this.retornoBuscarEmpresaId(response), 
            (error) => this.RetornoErro(error),
            () => (this.loader = !this.loader))
       
        },
        avaliarAtendimento(item) {
            debugger

            this.requestBuscarAvaliacao(item)
            this.dialogAvaliacaoView = !this.dialogAvaliacaoView
        },
        close(retorno) {
            this.dialogAvaliacaoView = !this.dialogAvaliacaoView
        },
        requestBuscarAvaliacao(item) {
            debugger
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

        retornoBuscarEmpresaId(response) {
            this.Reservas = []
            
            response.data.forEach(element => {
                    this.Reservas.push({
                            Id: element.id,
                            Usuario: element.usuario.nome,
                            Data: this.FormatDate(new Date(element.dataReserva).toISOString().substring(0,10)),
                            Horario: element.periodo != null ? element.periodoId + ' - ' + element.periodo.descricao : this.parseTimeDate(element.horario),
                            Servico: element.servico != null ? element.servico.descricao + ' - R$ ' + parseFloat(element.servico.valor).toFixed(2) : null,
                            Pessoas: element.quantidadePessoas,
                            Status:  this.RetornoStatus(element),
                            Reservado: element.reservado,
                            EhComomoracao: element.ehComemoracao ? 'Sim' : 'Não',
                            Observacoes: element.descricaoComemoracao,
                            DescricaoCancelamento: element.motivoCancelamento,
                            Avaliacao: element.avaliado
                    })
                });

                this.ReservasView = this.Reservas

                if (this.hideFilterDate)
                    this.aplicarFiltroData()
        },

        filtro(item) {
            if (item.id == 1)
                this.hideFilterDate = !this.hideFilterDate
        },

        aplicarFiltroDataInicial(retorno) {
            this.dataInicial = retorno
        },

        aplicarFiltroDataFinal(retorno) {
            this.dataFinal = retorno
        },

        deletarFiltroData() {

            this.loader = !this.loader;

            this.datainicial = new Date().toLocaleDateString(),
            this.dataFinal = new Date().toLocaleDateString(),
            this.ReservasView = []
            this.ReservasView = this.Reservas

            setTimeout(() => {
                this.loader = !this.loader;
            }, 500)
        },

        aplicarFiltroData() {
            
            debugger
            let dtInicial = new Date(this.parseDate(this.dataInicial) + ' 00:00')
            let dtFinal = new Date(this.parseDate(this.dataFinal) + ' 23:59')
            
            if (dtInicial > dtFinal) {
                this.EnableAlert("Data Inicial não pode ser maior que a Data Final.", "warning")
                return 
            } 
            
            this.loader = !this.loader;

            this.ReservasView = []
            this.Reservas.filter((element) => {

                let dt = new Date(this.parseDate(element.Data))
                dt.setDate(dt.getDate() + 1)

                if ((dt >= dtInicial || dt == dtInicial) && 
                    (dt <= dtFinal || dt == dtFinal))
                    this.ReservasView.push(element)
            })

            setTimeout(() => {
                this.loader = !this.loader;
            }, 500)
        }
    },
    
    created() {
        this.requestBuscarPorEmpresaId()
    },

    watch: {
        date (val) {
            this.dateFormatted = this.FormatDate(this.date)
        },

        refresh (val) {
            this.hideFilterDate = false
            this.requestBuscarPorEmpresaId()
        }
    },

    props: {
        dadosUsuario: Object,
        refresh: Boolean
    }
}
</script>
<style scoped>
    .complementar {
        padding: 20px !important;
    }

    .font-color {
        color: black;
    }
</style>