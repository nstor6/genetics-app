import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug para ver las peticiones
    console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error("❌ Error en request interceptor:", error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Si es 401, redirigir a login
    if (error.response?.status === 401) {
      console.log("🔒 Token expirado o inválido, redirigiendo a login...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Solo redirigir si no estamos ya en login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
