export default {
    data: () => ({
        alerta: false,
        textoAlerta: "",
        tipoAlerta: "",
        loader: false,
        dialog: false,
        search: '',
        maskTelefone: '(##) #####-####',
        maskCnpj: '##.###.###/####-##',
        maskCep: '##.###-###',
        currentDate: new Date(new Date().toISOString()),
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
            }, 2300)
        },
        getColor(status) {
            if (status == 'Cancelada') return 'error'
            else if (status == 'Aguardando') return 'warning'
            else return 'success'
        },

        RetornoErro(error) {
            debugger
            let retorno = error.response == undefined || error.response.status == 401 ? error.message : error.response.data

            this.EnableAlert(retorno, "error")
            window.scrollTo(0,0);
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
        }
    }
}