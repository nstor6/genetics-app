<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>🐄 Genetics</h1>
        <p>Sistema de Gestión Ganadera</p>
      </div>

      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="admin@genetics.com"
            required
          />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input
            v-model="password"
            type="password"
            placeholder="admin123"
            required
          />
        </div>

        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? "Entrando..." : "Entrar" }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="debug-info">
          <p><strong>API URL:</strong> {{ apiUrl }}</p>
          <p>
            <strong>Estado Backend:</strong>
            <span :class="backendStatusClass">{{ backendStatusText }}</span>
          </p>
        </div>
      </form>

      <div class="demo-credentials">
        <h3>🔑 Credenciales de Demo:</h3>
        <p><strong>Email:</strong> admin@genetics.com</p>
        <p><strong>Contraseña:</strong> admin123</p>
        <button @click="fillDemo" class="demo-btn">Usar Demo</button>
        <button @click="createDemoUser" class="demo-btn create-user-btn">
          Crear Usuario Demo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../services/api";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const backendStatus = ref("checking");
const router = useRouter();

const apiUrl = import.meta.env.VITE_API_URL;

const backendStatusClass = computed(() => {
  switch (backendStatus.value) {
    case "online":
      return "status-online";
    case "offline":
      return "status-offline";
    default:
      return "status-checking";
  }
});

const backendStatusText = computed(() => {
  switch (backendStatus.value) {
    case "online":
      return "✅ Conectado";
    case "offline":
      return "❌ Desconectado";
    default:
      return "🔄 Verificando...";
  }
});

const checkBackend = async () => {
  try {
    backendStatus.value = "checking";
    
    // Usar endpoint público de health check
    await api.get("/health/");
    backendStatus.value = "online";
    error.value = "";
    
  } catch (err) {
    backendStatus.value = "offline";
    console.error("Error conectando al backend:", err);
    
    if (err.code === "ERR_NETWORK") {
      error.value = "❌ No se puede conectar al backend. ¿Está corriendo Django en localhost:8000?";
    } else {
      error.value = "❌ Error de conexión con el backend";
    }
  }
};

const login = async () => {
  if (backendStatus.value !== "online") {
    error.value = "❌ Backend no disponible. Verifica que Django esté ejecutándose.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    console.log("Intentando login con:", {
      email: email.value,
      password: "***",
    });
    console.log("URL API:", `${apiUrl}/auth/login/`);

    const response = await api.post("/auth/login/", {
      email: email.value,
      password: password.value,
    });

    console.log("Respuesta del servidor:", response.data);

    if (response.data.access) {
      localStorage.setItem("token", response.data.access);
      
      // Opcional: Guardar información del usuario
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      
      router.push("/resumen");
    } else {
      error.value = "❌ Respuesta inválida del servidor";
    }
  } catch (err) {
    console.error("Error completo:", err);
    console.error("Response data:", err.response?.data);
    console.error("Status:", err.response?.status);

    if (err.response?.status === 401) {
      error.value = "❌ Credenciales incorrectas";
    } else if (err.response?.status === 400) {
      const errorMsg = err.response.data?.detail || 
                     err.response.data?.non_field_errors?.[0] ||
                     JSON.stringify(err.response.data);
      error.value = `❌ Datos inválidos: ${errorMsg}`;
    } else if (err.code === "ERR_NETWORK") {
      error.value = "❌ Error de red. ¿Está corriendo el backend en localhost:8000?";
    } else {
      error.value = `❌ Error del servidor: ${err.response?.data?.detail || err.message}`;
    }
  } finally {
    loading.value = false;
  }
};

const fillDemo = () => {
  email.value = "admin@genetics.com";
  password.value = "admin123";
};

const createDemoUser = async () => {
  try {
    loading.value = true;
    error.value = "";
    
    const response = await api.post("/auth/register/", {
      email: "admin@genetics.com",
      password: "admin123",
      nombre: "Admin",
      apellidos: "Demo",
      rol: "admin"
    });
    
    console.log("Usuario demo creado:", response.data);
    alert("✅ Usuario demo creado exitosamente");
    fillDemo();
    
  } catch (err) {
    console.error("Error creando usuario demo:", err);
    
    if (err.response?.status === 400) {
      // Usuario probablemente ya existe
      alert("ℹ️ El usuario demo ya existe. Puedes usar las credenciales mostradas.");
      fillDemo();
    } else {
      error.value = `❌ Error creando usuario demo: ${err.response?.data?.detail || err.message}`;
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  checkBackend();
});
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
}

.login-header p {
  margin: 0.5rem 0 0 0;
  color: #7f8c8d;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
}

.login-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #2980b9;
}

.login-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.error-message {
  background: #fadbd8;
  color: #e74c3c;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.debug-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.8rem;
}

.debug-info p {
  margin: 0.25rem 0;
}

.status-online {
  color: #27ae60;
  font-weight: 600;
}

.status-offline {
  color: #e74c3c;
  font-weight: 600;
}

.status-checking {
  color: #f39c12;
  font-weight: 600;
}

.demo-credentials {
  margin-top: 2rem;
  padding: 1rem;
  background: #e8f6fd;
  border-radius: 8px;
  text-align: center;
}

.demo-credentials h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.demo-credentials p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #34495e;
}

.demo-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin: 0.25rem;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.demo-btn:hover {
  background: #229954;
}

.create-user-btn {
  background: #3498db;
}

.create-user-btn:hover {
  background: #2980b9;
}
</style>