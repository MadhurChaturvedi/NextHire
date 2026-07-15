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
  const isProd = process.env.NODE_ENV === "production";
  // Prefer localhost backend during development to make the dev flow reliable.
  if (!isProd) {
    rawBase = "http://localhost:5000/api";
  } else {
    rawBase =
      isBrowser && (hostname === "localhost" || hostname === "127.0.0.1")
        ? "http://localhost:5000/api"
        : "https://next-gger.onrender.com/api";
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
