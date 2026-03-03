import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://3pl-dynamics-rho.vercel.app/api",
  // baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config:any) => {
  const token = await AsyncStorage.getItem("token");
  console.log("TOKEN FROM STORAGE:", token);
  console.log("REQUEST URL:", config.url);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// apiClient.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default apiClient;
