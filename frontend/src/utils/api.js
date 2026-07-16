import axios from "axios";

// Prefer Vite-provided API URL (`VITE_API_URL`).
// Fallbacks:
// - development: `http://localhost:5000/api`
// - production: use `VITE_API_URL` if set, otherwise call relative `/api` (same origin).
const envBase =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_API_URL
    : undefined;
const isProd =
  typeof import.meta !== "undefined" && import.meta.env
    ? !!import.meta.env.PROD
    : process.env.NODE_ENV === "production";

let rawBase = envBase;
if (!rawBase) {
  if (!isProd) {
    rawBase = "http://localhost:5000/api";
  } else {
    // In production, prefer a relative `/api` so the frontend talks to the same origin
    // unless an explicit `VITE_API_URL` was provided at build time.
    rawBase = "/api";
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

// Helpful debug: show which API base is in use
if (
  typeof window !== "undefined" &&
  window.console &&
  process.env.NODE_ENV !== "production"
) {
  console.debug("API base URL:", base);
}

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
