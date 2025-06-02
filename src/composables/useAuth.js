// src/composables/useAuth.js
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const user = ref(null);
const token = ref(null);

export function useAuth() {
  const router = useRouter();

  // Computed para verificar si está autenticado
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value;
  });

  // Computed para verificar si es admin
  const isAdmin = computed(() => {
    return user.value?.rol === "admin";
  });

  // Cargar datos de autenticación desde localStorage
  const loadAuthData = () => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        token.value = storedToken;
        user.value = JSON.parse(storedUser);
        console.log("✅ Datos de autenticación cargados:", user.value.email);
        return true;
      }
    } catch (error) {
      console.error("❌ Error cargando datos de autenticación:", error);
      clearAuthData();
    }
    return false;
  };

  // Limpiar datos de autenticación
  const clearAuthData = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("configuraciones");
    sessionStorage.clear();
    console.log("🧹 Datos de autenticación limpiados");
  };

  // Login
  const login = async (credentials) => {
    try {
      console.log("🔐 Intentando login...");
      const response = await api.post("/auth/login/", credentials);

      if (response.data.access && response.data.user) {
        token.value = response.data.access;
        user.value = response.data.user;

        // Guardar en localStorage
        localStorage.setItem("token", response.data.access);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        console.log("✅ Login exitoso:", user.value.email);
        return { success: true, user: user.value };
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (error) {
      console.error("❌ Error en login:", error);

      let errorMessage = "Error de conexión";
      if (error.response?.status === 401) {
        errorMessage = "Credenciales incorrectas";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = async (showConfirm = true) => {
    if (showConfirm && !confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      return;
    }

    try {
      console.log("🔓 Cerrando sesión...");

      // Intentar cerrar sesión en el servidor
      if (token.value) {
        try {
          await api.post("/auth/logout/");
        } catch (error) {
          console.warn("⚠️ No se pudo notificar logout al servidor:", error);
        }
      }

      // Limpiar datos locales
      clearAuthData();

      // Redirigir a login
      await router.replace("/login");

      console.log("✅ Sesión cerrada exitosamente");
    } catch (error) {
      console.error("❌ Error durante logout:", error);
      // Forzar limpieza y redirección incluso si hay errores
      clearAuthData();
      window.location.href = "/login";
    }
  };

  // Verificar si el token es válido
  const verifyToken = async () => {
    if (!token.value) {
      return false;
    }

    try {
      const response = await api.get("/auth/mi-perfil/");
      if (response.data) {
        user.value = response.data;
        localStorage.setItem("user", JSON.stringify(response.data));
        return true;
      }
    } catch (error) {
      console.warn("⚠️ Token inválido o expirado");
      clearAuthData();
      return false;
    }

    return false;
  };

  // Actualizar datos del usuario
  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData };
    localStorage.setItem("user", JSON.stringify(user.value));
  };

  // Inicializar al cargar
  loadAuthData();

  return {
    // Estado
    user: computed(() => user.value),
    token: computed(() => token.value),
    isAuthenticated,
    isAdmin,

    // Métodos
    login,
    logout,
    verifyToken,
    updateUser,
    clearAuthData,
    loadAuthData,
  };
}
