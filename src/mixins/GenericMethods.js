export default {
    data: () => ({
        alerta: false,
        textoAlerta: "",
        tipoAlerta: "",
        loader: false,
        dialog: false,
        search: '',
        maskTelefone: '(##) #####-####',
        maskTelefone1: '(##) ####-####',
        maskCnpj: '##.###.###/####-##',
        maskCep: '##.###-###',
        currentDate: new Date(new Date().toISOString()),
        SimNao: ['Sim', 'Não'],
        required: [
            v => !!v || 'Campo Obrigatório'
        ],
        emailRules: [
            v => !!v || 'Campo Obrigatório',
            v => /.+@.+\..+/.test(v) || 'Usuário deve ser um email valido.',
        ]
    }),
    methods: {
        EnableAlert(texto, tipoAlerta) {
            this.alerta = true
            this.tipoAlerta = tipoAlerta
            this.textoAlerta = texto

            setTimeout(() => {
                this.alerta = false
            }, 3500)
        },
        getColor(status) {
            if (status == 'Cancelada') return 'error'
            else if (status == 'Aguardando') return 'warning'
            else if (status == 'Pendente') return 'dark'
            else if (status == 'Reservado') return 'primary'
            else return 'success'
        },

        RetornoStatus(element) {

            let dtHora = new Date(element.dataReserva).toISOString().substring(0,10)+ ' ' 
                        + this.parseTimeDate(new Date(element.periodo == null ? element.horario : element.dataReserva))

            let dataReserva = new Date(dtHora)

            let dtAgora = new Date(new Date().toISOString())

            if (element.periodo != null) {
                dtAgora.setHours(0)
                dtAgora.setMinutes(0)
                dtAgora.setSeconds(0)
                dtAgora.setMilliseconds(0)
            }

            if (!element.cancelada && !element.ativo && dataReserva < dtAgora)
                return 'Pendente'

            else if (element.cancelada)
                return 'Cancelada'
            else if (element.ativo)
                return 'Concluida'
            else if (element.reservado && !element.ativo)
                return 'Reservado'
            else
                return "Aguardando"
        },

        RetornoErro(error) {
            debugger
            let retorno = error.response == undefined || error.response.status == 401 ? error.message : error.response.data

            this.EnableAlert(retorno, "error")
            console.log(error)
        },

        FormatDate(date) {
            if (!date) return null

            const [year, month, day] = date.split('-')
            return `${day}/${month}/${year}`
        },

        parseDate(date) {
            if (!date) return null
            
            const [day, month, year] = date.split('/')
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        },

        parseTime(date, time) {
            if (!time || !date) return null
            return new Date(this.parseDate(date) + ' ' + time+':00.000Z').toISOString()
        },

        parseTimeDate(date) {
            if (!date) return null
            return new Date(date).getHours()+':'+(new Date(date).getMinutes()).toString().padStart(2, 0)
        },
    }
}