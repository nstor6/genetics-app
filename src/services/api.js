import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Función para limpiar sesión y redirigir
const clearSessionAndRedirect = () => {
  console.log("🔓 Limpiando sesión por token inválido...");

  // Limpiar almacenamiento
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("configuraciones");
  sessionStorage.clear();

  // Redirigir solo si no estamos ya en login
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

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

    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      console.log("🔒 Token expirado o inválido");

      // Solo limpiar y redirigir si no estamos en endpoints de auth
      const isAuthEndpoint =
        error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");

      if (!isAuthEndpoint) {
        clearSessionAndRedirect();
      }
    }

    // Manejar errores de servidor (500)
    if (error.response?.status >= 500) {
      console.error("🚨 Error del servidor:", error.response?.data);
    }

    // Manejar errores de red
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      console.error("⏱️ Timeout de conexión");
    }

    if (error.code === "ERR_NETWORK") {
      console.error("🌐 Error de red - servidor no disponible");
    }

    return Promise.reject(error);
  }
);

export default api;
