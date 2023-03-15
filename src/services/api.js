import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:14028/api/",
    //baseURL: "http://192.168.3.27/api/",
});

api.defaults.headers.common['Authorization'] = localStorage.getItem('token')

export default api;