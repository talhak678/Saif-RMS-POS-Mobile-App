import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

const apiClient = axios.create({
  baseURL: "https://saif-rms-pos-backend-tau.vercel.app/api",
  // baseURL: "http://172.19.0.1:3000/api",

  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
apiClient.interceptors.request.use(async (config: any) => {
  const token = await AsyncStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 or 402
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 402) {
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user_data");
      router.replace("/(auth)/sign-in");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
