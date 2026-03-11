import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const apiProtected = axios.create({
  baseURL: "https://saif-rms-pos-backend-tau.vercel.app/api",
  // baseURL: "http://172.19.0.1:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach token for all requests
apiProtected.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiProtected;
