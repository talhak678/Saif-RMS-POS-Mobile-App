import apiClient from "./apiClient";
import apiPublic from "./apiPublic";

// Login — POST /auth/login (NO auth header needed — use clean public instance)
export const loginApi = (data: { email: string; password: string }) =>
  apiPublic.post("/auth/login", data);

// Get current user — GET /auth/me (requires Authorization header)
export const getMeApi = () => apiClient.get("/auth/me");

// Logout — POST /auth/logout (requires Authorization header)
export const logoutApi = () => apiClient.post("/auth/logout");

