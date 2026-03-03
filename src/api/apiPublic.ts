import axios from "axios";

const apiPublic = axios.create({
  // baseURL: "https://3pl-dynamics-rho.vercel.app/api",
  baseURL: "https://saif-rms-pos-backend.vercel.app/api",
  headers: { "Content-Type": "application/json" },
});

export default apiPublic;
