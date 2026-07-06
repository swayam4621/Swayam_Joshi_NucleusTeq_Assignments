const API_BASE_URL = "http://localhost:8000";
const TOKEN_KEY = "circleup_token";

const Auth = {
  getToken() { return sessionStorage.getItem(TOKEN_KEY); },
  setToken(token) { sessionStorage.setItem(TOKEN_KEY, token); },
  clearToken() { sessionStorage.removeItem(TOKEN_KEY); },
  isLoggedIn() { return Boolean(this.getToken()); },
};

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function extractErrorMessage(data) {
  if (!data || !data.detail) return "Something went wrong. Please try again.";
  const detail = data.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item.msg === "string") {
          return item.msg.replace(/^Value error,\s*/i, "");
        }
        return "Invalid input.";
      })
      .join(" ");
  }

  return "Something went wrong. Please try again.";
}

async function apiRequest(path, { method = "GET", body = null, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  
  if (auth) {
    const token = Auth.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    console.error("Network Error:", networkErr);
    throw new ApiError("Could not reach the server. Please check your connection and ensure the backend is running.", 0);
  }

  let data = null;
  try { data = await response.json(); } catch (_) {}

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(data), response.status);
  }

  return data;
}

const CircleUpAPI = {
  // auth  users
  register: (payload) => apiRequest("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (email, password) => apiRequest("/auth/login", { method: "POST", body: { email, password }, auth: false }),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
  getCurrentUser: () => apiRequest("/auth/me", { method: "GET" }),
  updateProfile: (payload) => apiRequest("/users/me", { method: "PATCH", body: payload }),

  // Activities
  listActivities: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.location) params.set("location", filters.location);
    if (filters.sort) params.set("sort", filters.sort);
    
    if (filters.date_from) params.set("date_from", filters.date_from);
    if (filters.date_to) params.set("date_to", filters.date_to);
    
    const query = params.toString();
    return apiRequest(`/activities${query ? `?${query}` : ""}`, { method: "GET", auth: true }); 
  },
  getActivity: (id) => apiRequest(`/activities/${id}`, { method: "GET", auth: true }),
  createActivity: (payload) => apiRequest("/activities", { method: "POST", body: payload }),
  updateActivity: (id, payload) => apiRequest(`/activities/${id}`, { method: "PATCH", body: payload }),
  cancelActivity: (id) => apiRequest(`/activities/${id}/cancel`, { method: "PATCH", auth: true }),

  requestParticipation: (activityId, count) => apiRequest(`/activities/${activityId}/requests`, { method: "POST", body: { participant_count: count } }),
  listActivityRequests: (activityId) => apiRequest(`/activities/${activityId}/requests`, { method: "GET" }),
  approveParticipationRequest: (requestId) => apiRequest(`/activities/requests/${requestId}/approve`, { method: "POST" }),
  rejectParticipationRequest: (requestId) => apiRequest(`/activities/requests/${requestId}/reject`, { method: "POST" })
};