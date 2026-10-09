import api from "./api";

export const login = (userId, password) =>
    api.post("/auth/login", { userId, email: userId, password });

export const register = (userData) =>
    api.post("/auth/register", userData);

export const getMe = () => api.get("/auth/me");