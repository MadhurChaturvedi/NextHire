import axios from "axios";

// Use the deployed API URL directly for production.
// Deployed backend URL (includes /api):
const base = "https://next-gger.onrender.com/api";
const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;

const api = axios.create({
  baseURL: normalizedBase,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Automatically inject JWT token into request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
