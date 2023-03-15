import api from "@/services/api";

export default {

    methods: {
        
        RequestPost(url, dados, functionResponse, functionErro, after) {

            api.post(url, dados)
            .then(response => functionResponse(response))
            .catch(error => functionErro(error))
            .finally(() => after())
        },

        RequestGet(url, functionResponse, functionErro, after) {

            api.get(url)
            .then(response => functionResponse(response))
            .catch(error => functionErro(error))
            .finally(() => after())
        },

        RequestPut(url, dados, functionResponse, functionErro, after) {

            api.put(url, dados)
            .then(response => functionResponse(response))
            .catch(error => functionErro(error))
            .finally(() => after())
        },

        RequestDelete(url, functionResponse, functionErro, after) {

            api.delete(url)
            .then(response => functionResponse(response))
            .catch(error => functionErro(error))
            .finally(() => after())
        },
    },
}