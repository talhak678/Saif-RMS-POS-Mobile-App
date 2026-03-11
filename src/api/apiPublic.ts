import axios from "axios";

const apiPublic = axios.create({
  baseURL: "https://saif-rms-pos-backend-tau.vercel.app/api",
  // baseURL: "http://172.19.0.1:3000/api",
  headers: { "Content-Type": "application/json" },
});

export default apiPublic;
