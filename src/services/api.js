import axios from "axios";

// Configuración base de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  timeout: 30000, // Aumentado a 30 segundos
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Variable para controlar reconexiones
let isReconnecting = false;

// Función para limpiar sesión y redirigir
const clearSessionAndRedirect = () => {
  if (isReconnecting) return; // Evitar múltiples ejecuciones
  isReconnecting = true;

  console.log("🔓 Limpiando sesión por token inválido...");

  // Limpiar almacenamiento
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("configuraciones");
  sessionStorage.clear();

  // Redirigir solo si no estamos ya en login
  if (window.location.pathname !== "/login") {
    console.log("🔄 Redirigiendo a login...");
    window.location.href = "/login";
  }

  // Reset flag después de un momento
  setTimeout(() => {
    isReconnecting = false;
  }, 1000);
};

// Función para verificar si el backend está disponible
const checkBackendHealth = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/health/`, {
      timeout: 5000,
    });
    console.log("✅ Backend health check OK:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Backend health check failed:", error.message);
    return false;
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
      headers: {
        Authorization: config.headers.Authorization ? "Bearer ***" : "None",
        "Content-Type": config.headers["Content-Type"],
      },
      data: config.data ? "Present" : "None",
      timeout: config.timeout,
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
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: Array.isArray(response.data) ? `Array(${response.data.length})` : "Object",
    });
    return response;
  },
  async (error) => {
    const config = error.config;
    const method = config?.method?.toUpperCase() || "UNKNOWN";
    const url = config?.url || "unknown";

    console.error(`❌ ${method} ${url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
    });

    // Manejar diferentes tipos de errores
    if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
      console.error("🌐 Error de red o timeout");

      // Si es timeout, verificar si el backend está disponible
      if (error.code === "ECONNABORTED") {
        console.log("⏱️ Timeout detectado, verificando estado del backend...");
        const backendUp = await checkBackendHealth();

        if (!backendUp) {
          console.error("🚨 Backend no disponible");
          // Podrías mostrar un modal o notificación aquí
        }
      }
    } else if (error.response?.status === 401) {
      console.log("🔒 Token expirado o inválido");

      // Solo limpiar y redirigir si no estamos en endpoints de auth
      const isAuthEndpoint =
        url?.includes("/auth/login") ||
        url?.includes("/auth/register") ||
        url?.includes("/health") ||
        url?.includes("/cors-test");

      if (!isAuthEndpoint) {
        clearSessionAndRedirect();
      }
    } else if (error.response?.status === 403) {
      console.error("🚫 Acceso denegado - permisos insuficientes");
    } else if (error.response?.status >= 500) {
      console.error("🚨 Error del servidor:", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.response?.status === 404) {
      console.error("🔍 Recurso no encontrado");
    } else if (error.response?.status >= 400 && error.response?.status < 500) {
      console.error("⚠️ Error del cliente:", {
        status: error.response.status,
        data: error.response.data,
      });
    }

    return Promise.reject(error);
  }
);

// Función de utilidad para hacer peticiones con reintentos
const requestWithRetry = async (requestFn, maxRetries = 2) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      console.log(`❌ Intento ${attempt} fallido:`, error.message);

      // No reintentar en ciertos casos
      if (
        error.response?.status === 401 || // No autorizado
        error.response?.status === 403 || // Prohibido
        error.response?.status === 404 || // No encontrado
        error.code === "ERR_NETWORK" // Error de red
      ) {
        break;
      }

      // Esperar antes del siguiente intento
      if (attempt <= maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // Backoff exponencial
        console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// Métodos de conveniencia con reintentos
api.getWithRetry = (url, config = {}) => requestWithRetry(() => api.get(url, config));

api.postWithRetry = (url, data = {}, config = {}) => requestWithRetry(() => api.post(url, data, config));

api.putWithRetry = (url, data = {}, config = {}) => requestWithRetry(() => api.put(url, data, config));

api.deleteWithRetry = (url, config = {}) => requestWithRetry(() => api.delete(url, config));

// Función para verificar conectividad
api.checkConnection = async () => {
  try {
    await api.get("/health/", { timeout: 5000 });
    return true;
  } catch (error) {
    console.error("❌ Check connection failed:", error.message);
    return false;
  }
};

// Función para obtener información del servidor
api.getServerInfo = async () => {
  try {
    const response = await api.get("/health/");
    return response.data;
  } catch (error) {
    console.error("❌ No se pudo obtener información del servidor:", error);
    return null;
  }
};

// Función para probar CORS
api.testCors = async () => {
  try {
    const response = await api.get("/cors-test/");
    console.log("✅ CORS test successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ CORS test failed:", error);
    throw error;
  }
};

// Log de configuración inicial
console.log("🔧 API configurada:", {
  baseURL: api.defaults.baseURL,
  timeout: api.defaults.timeout,
  headers: api.defaults.headers,
});

export default api;
