import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hostel_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hostel_token");
      localStorage.removeItem("hostel_user");
      window.dispatchEvent(new Event("auth-expired"));
    }
    return Promise.reject(error);
  },
);

export const authService = {
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
  me: () => api.get("/auth/me"),
};

export const studentService = {
  list: () => api.get("/students"),
  get: (id) => api.get(`/students/${id}`),
  create: (payload) => api.post("/students", payload),
  update: (id, payload) => api.put(`/students/${id}`, payload),
  remove: (id) => api.delete(`/students/${id}`),
};

export const roomService = {
  list: () => api.get("/rooms"),
  get: (id) => api.get(`/rooms/${id}`),
  create: (payload) => api.post("/rooms", payload),
  update: (id, payload) => api.put(`/rooms/${id}`, payload),
  remove: (id) => api.delete(`/rooms/${id}`),
};

export const allocationService = {
  list: () => api.get("/allocations"),
  mine: () => api.get("/allocations/mine"),
  get: (id) => api.get(`/allocations/${id}`),
  create: (payload) => api.post("/allocations", payload),
  update: (id, payload) => api.put(`/allocations/${id}`, payload),
  remove: (id) => api.delete(`/allocations/${id}`),
};

export const feedbackService = {
  list: () => api.get("/feedback"),
  create: (payload) => api.post("/feedback", payload),
  update: (id, payload) => api.put(`/feedback/${id}`, payload),
  remove: (id) => api.delete(`/feedback/${id}`),
};

export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error.response?.data?.message || (error.code === "ERR_NETWORK" ? "The server is unavailable. Check that the backend is running." : fallback);

export default api;
