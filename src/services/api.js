import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:14028/api/",
    //baseURL: "http://192.168.3.27/api/",
    //baseURL: "http://15.228.235.81/api",
    //baseURL: "https://localhost:44398/api",
    //baseURL: "http://15.228.235.81:81/api",
});

api.defaults.headers.common['Authorization'] = localStorage.getItem('token')

export default api;