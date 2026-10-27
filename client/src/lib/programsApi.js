/*
  All program API calls live here so auth / base URL changes happen in ONE place.

  TODO: set VITE_API_URL in client/.env (e.g. VITE_API_URL=http://localhost:5000/api)
  Admin token is read from localStorage ("adminToken") and sent as a Bearer header, same as the dashboard.
*/

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () =>
  localStorage.getItem("adminToken") || localStorage.getItem("token") || "";

async function request(path, { method = "GET", body, isForm = false, auth = false } = {}) {
  const headers = {};

  if (!isForm && body) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    const error = new Error(data.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const programsApi = {
  listPublic: () => request("/programs"),

  listAdmin: () => request("/programs/admin/all", { auth: true }),
  create: (formData) => request("/programs", { method: "POST", body: formData, isForm: true, auth: true }),
  update: (id, formData) =>
    request(`/programs/${id}`, { method: "PUT", body: formData, isForm: true, auth: true }),
  setStatus: (id, status) =>
    request(`/programs/${id}/status`, { method: "PATCH", body: { status }, auth: true }),
  reorder: (order) => request("/programs/reorder", { method: "PATCH", body: { order }, auth: true }),
  remove: (id) => request(`/programs/${id}`, { method: "DELETE", auth: true }),
};