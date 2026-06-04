import axios from "axios";

// Prefer environment-provided API URL (Vite: VITE_API_URL).
// If not provided, default to the local backend during development (http://localhost:5000/api),
// otherwise default to the deployed backend.
const envBase =
  typeof import.meta !== "undefined" ? import.meta.env.VITE_API_URL : undefined;
let rawBase = envBase;
if (!rawBase) {
  const isBrowser = typeof window !== "undefined";
  const hostname = isBrowser ? window.location.hostname : "";
  // If running on localhost during development, target the local backend port
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    rawBase = "http://localhost:5000/api";
  } else {
    // production default (deployed backend)
    rawBase = "https://next-gger.onrender.com/api";
  }
}
const base = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

const api = axios.create({
  baseURL: base,
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
