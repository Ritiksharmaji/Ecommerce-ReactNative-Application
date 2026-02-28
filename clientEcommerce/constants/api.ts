import axios from "axios";
import { Platform } from "react-native";

const LOCAL_API_URL = Platform.select({
    android: "http://10.187.147.11:3000/api",
    ios: "http://10.187.147.11:3000/api",
    default: "http://localhost:3000/api",
});

const api = axios.create({ baseURL: LOCAL_API_URL });

export default api;


// import axios from "axios";
// import { Platform } from "react-native";

// const LOCAL_API_URL = Platform.select({
//     android: "http://10.187.147.11:3000/api",
//     ios: "http://10.187.147.11:3000/api",
//     default: "http://localhost:3000/api",
// });

// console.log('API Base URL:', LOCAL_API_URL); // Add this for debugging

// const api = axios.create({ 
//     baseURL: LOCAL_API_URL,
//     timeout: 10000, // Add timeout
// });

// // Add request interceptor for debugging
// api.interceptors.request.use(
//     config => {
//         console.log('Making request to:', config.baseURL + config.url);
//         return config;
//     },
//     error => {
//         return Promise.reject(error);
//     }
// );

// export default api;