const API_BASE_URL = "http://localhost:8000";
const TOKEN_KEY = "circleup_token";

const Auth = {
  getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
  },
  isLoggedIn() {
    return Boolean(this.getToken());
  },
};

/**
 * Core request helper
 * @param {string} path "/auth/login"
 * @param {object} options - { method, body, auth }
 */
async function apiRequest(path, { method = "GET", body = null, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = Auth.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError(
      "Could not reach the server. Please check your connection and try again.",
      0
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    // No JSON body — fine.
  }

  if (!response.ok) {
    const message = (data && data.detail) || "Something went wrong. Please try again.";
    throw new ApiError(message, response.status);
  }

  return data;
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const CircleUpAPI = {
  register(payload) {
    return apiRequest("/auth/register", { method: "POST", body: payload, auth: false });
  },
  login(email, password) {
    return apiRequest("/auth/login", { method: "POST", body: { email, password }, auth: false });
  },
  logout() {
    return apiRequest("/auth/logout", { method: "POST" });
  },
  getCurrentUser() {
    return apiRequest("/auth/me", { method: "GET" });
  },
  updateProfile(payload) {
    return apiRequest("/users/me", { method: "PATCH", body: payload });
  },

  // --- Activities ---
  listActivities(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.location) params.set("location", filters.location);
    if (filters.date_from) params.set("date_from", filters.date_from);
    if (filters.date_to) params.set("date_to", filters.date_to);
    if (filters.sort) params.set("sort", filters.sort);
    const query = params.toString();
    return apiRequest(`/activities${query ? `?${query}` : ""}`, { method: "GET", auth: true });
  },
  getActivity(id) {
    return apiRequest(`/activities/${id}`, { method: "GET", auth: true });
  },
  requestParticipation(activityId) {
    return apiRequest(`/activities/${activityId}/requests`, { method: "POST" });
  },
  listActivityRequests(activityId) {
    return apiRequest(`/activities/${activityId}/requests`, { method: "GET" });
  },
  approveParticipationRequest(requestId) {
    return apiRequest(`/activities/requests/${requestId}/approve`, { method: "POST" });
  },
  rejectParticipationRequest(requestId) {
    return apiRequest(`/activities/requests/${requestId}/reject`, { method: "POST" });
  },
  createActivity(payload) {
    return apiRequest("/activities", { method: "POST", body: payload });
  },
  updateActivity(id, payload) {
    return apiRequest(`/activities/${id}`, { method: "PATCH", body: payload });
  },
  cancelActivity(id) {
    return apiRequest(`/activities/${id}/cancel`, { method: "POST" });
  },
};