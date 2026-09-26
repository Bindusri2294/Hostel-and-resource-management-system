import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hostel_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    const url = originalRequest.url || "";
    if (url.includes("/auth/refresh") || url.includes("/auth/login") || url.includes("/auth/register")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject});
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = data.token;
        localStorage.setItem("hostel_token", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("hostel_token");
        localStorage.removeItem("hostel_user");
        window.dispatchEvent(new Event("auth-expired"));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export const authService = {
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
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
