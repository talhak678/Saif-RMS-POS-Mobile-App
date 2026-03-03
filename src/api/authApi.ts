import apiClient from "./apiClient";
import apiProtected from "./apiProtected";
import apiPublic from "./apiPublic";

export const registerApi = (data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}) => apiPublic.post("/auth/register", data);

export const loginApi = (data: { email: string; password: string }) =>
  apiProtected.post("/auth/login", data);

export const getProfileApi = () => apiClient.get("/profile");

export const updateProfileApi = (data: {
  first_name: string;
  last_name: string;
}) => apiClient.put("/profile", data);