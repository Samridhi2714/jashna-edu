const configuredApiUrl = import.meta.env.VITE_API_URL;

export const API_URL = (
  configuredApiUrl ||
  (import.meta.env.PROD
    ? "https://api.jashnaedu.com"
    : "http://localhost:5000")
).replace(/\/+$/, "");

export const API_BASE = `${API_URL}/api`;
