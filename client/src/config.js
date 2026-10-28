/*
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_BASE = `${API_URL}/api`;
*/
const configuredApiUrl = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD && !configuredApiUrl) {
  throw new Error(
    "Missing VITE_API_URL. Configure the production API URL before building."
  );
}

export const API_URL = (
  configuredApiUrl || "http://localhost:5000"
).replace(/\/+$/, "");

export const API_BASE = `${API_URL}/api`;