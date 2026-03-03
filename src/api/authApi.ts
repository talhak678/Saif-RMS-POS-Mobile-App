import apiClient from "./apiClient";

// Login — POST /auth/login
export const loginApi = (data: { email: string; password: string }) =>
  apiClient.post("/auth/login", data);

// Get current user — GET /auth/me (requires Authorization header)
export const getMeApi = () => apiClient.get("/auth/me");

// Logout — POST /auth/logout (requires Authorization header)
export const logoutApi = () => apiClient.post("/auth/logout");
