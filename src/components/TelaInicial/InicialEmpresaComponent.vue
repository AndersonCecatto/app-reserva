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
                cols="12"
                xs="3"
                sm="3"
                md="3"
                class="ml-5"
            >
                <data-dialog-field-component
                    @retornoData="aplicarFiltroDataInicial"
                    xs="3"
                    titulo="Data Inicial"
                />
            </v-col>
            <v-col 
                cols="12"
                xs="3"
                sm="3"
                md="3"
                class="ml-5"
            >
                <data-dialog-field-component
                    @retornoData="aplicarFiltroDataFinal"
                    xs="3"
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
                <td id="Teste" :colspan="headers.length" v-if="item.Status == 'Cancelada'" >
                    Motivo Cancelamento: {{ item.DescricaoCancelamento }}
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
    </v-card>
</template>
<script>

import LoadComponent from '../LoadComponent.vue';
import GenericMethods from '@/mixins/GenericMethods';
import DialogPersistentComponent from '../Field/DialogPersistentComponent.vue';
import AlertComponent from '../AlertComponent.vue';
import RequestMethods from '@/mixins/RequestMethods';
import DataDialogFieldComponent from '../Field/DataDialogFieldComponent.vue';

export default {
  components: { LoadComponent, DialogPersistentComponent, AlertComponent, DataDialogFieldComponent },

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
                window.scrollTo(0,0);
                return
            } 

            this.acao = "Cancelar"
            this.itemEnvio = item
            this.dialog = !this.dialog
        },
        requestAlterarStatus(id, cancelar, motivoCancelamento, ativo) {

            this.loader = !this.loader;

            this.RequestPost('Reserva/AlterarStatus',
            {
                id: id,
                Cancelada: cancelar,
                MotivoCancelamento: motivoCancelamento,
                Ativo: ativo,
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
                window.scrollTo(0,0);
                return
            }
            else if (item.Status == 'Cancelada') {
                this.EnableAlert("Reserva já cancelada.", "warning")
                window.scrollTo(0,0);
                return
            }

            this.requestAlterarStatus(item.Id, false, null, true)
        },
        retornoDialog(retorno) {

            if (retorno.acao == "Cancelar" && retorno.success) 
                this.requestAlterarStatus(retorno.response.Id, true, this.motivoCancelamento, true)

            this.dialog = !this.dialog
        },
        requestBuscarPorEmpresaId() {
            this.loader = !this.loader;
            
            this.Reservas = []

            this.RequestGet('Reserva/BuscarPorEmpresaId/'+this.dadosUsuario.EmpresaId,
            (response) => this.retornoBuscarEmpresaId(response), 
            (error) => this.RetornoErro(error),
            () => (this.loader = !this.loader))
       
        },

        retornoBuscarEmpresaId(response) {
            response.data.forEach(element => {
                    this.Reservas.push({
                            Id: element.id,
                            Usuario: element.usuario.nome,
                            Data: this.FormatDate(new Date(element.dataReserva).toISOString().substring(0,10)),
                            Horario: element.horario == null ? element.periodoId + ' - ' + element.periodo.descricao : this.parseTimeDate(element.horario),
                            Pessoas: element.quantidadePessoas,
                            Status:  element.cancelada ? 'Cancelada' : element.ativo ? "Concluida" : "Aguardando",
                            DescricaoCancelamento: element.motivoCancelamento
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
            this.datainicial = this.FormatDate(new Date().toISOString().substring(0, 10)),
            this.dataFinal = this.FormatDate(new Date().toISOString().substring(0, 10)),
            this.ReservasView = []
            this.ReservasView = this.Reservas
        },

        aplicarFiltroData() {
            
            let dtInicial = new Date(this.parseDate(this.dataInicial))
            let dtFinal = new Date(this.parseDate(this.dataFinal))
            
            if (dtInicial > dtFinal) {
                this.EnableAlert("Data Inicial não pode ser maior que a Data Final.", "warning")
                return 
            } 

            this.ReservasView = []
            this.Reservas.filter((element) => {

                let dt = new Date(this.parseDate(element.Data))

                if ((dt >= dtInicial || dt == dtInicial) && 
                    (dt <= dtFinal || dt == dtFinal))
                    this.ReservasView.push(element)
            })
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
<style>
    
</style>