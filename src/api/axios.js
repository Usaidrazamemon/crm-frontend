
import axios from "axios";

const api = axios.create({
  // Pehle env variable check karega, nahi toh direct aapke sahi backend par request bhejega
  baseURL: process.env.REACT_APP_API_URL || "https://crm-backend-vercel.vercel.app/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
