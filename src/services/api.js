// src/services/api.js
import axios from "axios";

// Base URL for the API
// For local development, you might want to use a mock API
const API_URL = process.env.REACT_APP_API_URL || "https://api.example.com";

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor for auth headers
api.interceptors.request.use(
  (config) => {
    // Get the token from local storage
    const token = localStorage.getItem("token");

    // If token exists, add it to the headers
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// API service functions
const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post("/auth/login", credentials),
    register: (userData) => api.post("/auth/register", userData),
    logout: () => api.post("/auth/logout"),
    getProfile: () => api.get("/auth/profile"),
    updateProfile: (userData) => api.put("/auth/profile", userData),
  },

  // Tasks endpoints
  tasks: {
    getAll: () => api.get("/tasks"),
    getById: (id) => api.get(`/tasks/${id}`),
    create: (taskData) => api.post("/tasks", taskData),
    update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
    delete: (id) => api.delete(`/tasks/${id}`),
    updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  },

  // Journal endpoints
  journal: {
    getAll: () => api.get("/journal"),
    getById: (id) => api.get(`/journal/${id}`),
    create: (entryData) => api.post("/journal", entryData),
    update: (id, entryData) => api.put(`/journal/${id}`, entryData),
    delete: (id) => api.delete(`/journal/${id}`),
  },

  // Motivation endpoints
  motivation: {
    getQuote: () => api.get("/motivation/quote"),
    getTips: () => api.get("/motivation/tips"),
  },

  // Statistics endpoints
  stats: {
    getOverview: () => api.get("/stats/overview"),
    getTasksByStatus: () => api.get("/stats/tasks-by-status"),
    getTasksByPriority: () => api.get("/stats/tasks-by-priority"),
    getTasksByMonth: () => api.get("/stats/tasks-by-month"),
    getProductivity: () => api.get("/stats/productivity"),
  },
};

export default apiService;
