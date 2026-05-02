import axios from "axios";

const API = axios.create({
<<<<<<< HEAD
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
=======
  baseURL: "http://localhost:5000/api",
>>>>>>> 6f5fd618279b49db3dbafc62e00ea301f8cc1163
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
