const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () =>
  localStorage.getItem("adminToken") ||
  localStorage.getItem("token") ||
  "";

async function request(
  path,
  { method = "GET", body, auth = false } = {}
) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}/recent-admissions${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    // Handle responses without JSON.
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status})`
    );
  }

  return data;
}

export const recentAdmissionsApi = {
  listPublic() {
    return request("/public");
  },

  listEligibleStudents() {
    return request("/students", { auth: true });
  },

  listAdmin() {
    return request("/", { auth: true });
  },

  create({ studentId, designation }) {
    return request("/", {
      method: "POST",
      body: { studentId, designation },
      auth: true,
    });
  },

  update(id, { designation }) {
    return request(`/${id}`, {
      method: "PATCH",
      body: { designation },
      auth: true,
    });
  },

  setPublication(id, isPublished) {
    return request(`/${id}/publish`, {
      method: "PATCH",
      body: { isPublished },
      auth: true,
    });
  },

  remove(id) {
    return request(`/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};