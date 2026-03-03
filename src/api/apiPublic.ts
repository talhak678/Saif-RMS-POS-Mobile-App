import axios from "axios";

const apiPublic = axios.create({
  // baseURL: "https://3pl-dynamics-rho.vercel.app/api",
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

export default apiPublic;
