import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (username: string, password: string) =>
    api.post("/auth/login", { username, password }),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get("/dashboard"),
};

// Rooms
export const roomsAPI = {
  getAll: () => api.get("/rooms"),
  getById: (id: string) => api.get(`/rooms/${id}`),
  create: (data: Record<string, unknown>) => api.post("/rooms", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/rooms/${id}`, data),
  delete: (id: string) => api.delete(`/rooms/${id}`),
};

// Tenants
export const tenantsAPI = {
  getAll: (params?: Record<string, string>) =>
    api.get("/tenants", { params }),
  getById: (id: string) => api.get(`/tenants/${id}`),
  create: (data: FormData) =>
    api.post("/tenants", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, data: FormData) =>
    api.put(`/tenants/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string) => api.delete(`/tenants/${id}`),
  assignRoom: (tenantId: string, roomId: string) =>
    api.put(`/tenants/${tenantId}/assign-room`, { roomId }),
  unassignRoom: (tenantId: string) =>
    api.put(`/tenants/${tenantId}/unassign-room`),
};

// Utilities
export const utilitiesAPI = {
  getAll: (params?: Record<string, string>) =>
    api.get("/utilities", { params }),
  createOrUpdate: (data: Record<string, unknown>) =>
    api.post("/utilities", data),
  finalize: (id: string) => api.put(`/utilities/${id}/finalize`),
  unfinalize: (id: string) => api.put(`/utilities/${id}/unfinalize`),
  delete: (id: string) => api.delete(`/utilities/${id}`),
};

// Payments
export const paymentsAPI = {
  getOverview: (params: Record<string, string>) =>
    api.get("/payments", { params }),
  toggleRentPaid: (id: string) => api.put(`/payments/${id}/toggle-rent`),
  toggleServicePaid: (id: string) => api.put(`/payments/${id}/toggle-service`),
  toggleUtilityPaid: (id: string) => api.put(`/payments/${id}/toggle-utility`),
  delete: (id: string) => api.delete(`/payments/${id}`),
};

export default api;
