const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");
const FAQ_ENDPOINT = `${API_BASE_URL}/api/faqs`;
/* ========================================================= HELPERS ========================================================= */ const getAdminToken =
  () => {
    return localStorage.getItem("adminToken");
  };
const getHeaders = (requiresAuth = false) => {
  const headers = { "Content-Type": "application/json" };
  if (requiresAuth) {
    const token = getAdminToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};
const request = async (url, options = {}) => {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new Error(
      "Unable to connect to the server. Please check whether the backend is running.",
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }
  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Request failed with status ${response.status}.`,
    );
  }
  return data;
};
/* ========================================================= PUBLIC — GET PUBLISHED FAQs GET /api/faqs ========================================================= */ export const getPublishedFAQs =
  async () => {
    return request(FAQ_ENDPOINT, { method: "GET" });
  };
/* ========================================================= ADMIN — GET ALL FAQs GET /api/faqs/admin/all ========================================================= */ export const getAllFAQs =
  async () => {
    return request(`${FAQ_ENDPOINT}/admin/all`, {
      method: "GET",
      headers: getHeaders(true),
    });
  };
/* ========================================================= ADMIN — CREATE FAQ POST /api/faqs ========================================================= */ export const createFAQ =
  async (faqData) => {
    return request(FAQ_ENDPOINT, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(faqData),
    });
  };
/* ========================================================= ADMIN — UPDATE FAQ PUT /api/faqs/:id ========================================================= */ export const updateFAQ =
  async (faqId, faqData) => {
    if (!faqId) {
      throw new Error("FAQ ID is required to update an FAQ.");
    }
    return request(`${FAQ_ENDPOINT}/${faqId}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(faqData),
    });
  };
/* ========================================================= ADMIN — DELETE FAQ DELETE /api/faqs/:id ========================================================= */ export const deleteFAQ =
  async (faqId) => {
    if (!faqId) {
      throw new Error("FAQ ID is required to delete an FAQ.");
    }
    return request(`${FAQ_ENDPOINT}/${faqId}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });
  };
