<template>
  <div class="ajustes-page">
    <div class="page-header">
      <h1>⚙️ Configuración</h1>
    </div>

    <!-- Información del usuario -->
    <div class="seccion-card">
      <h2>👤 Mi Perfil</h2>
      <div class="perfil-info">
        <div class="info-row">
          <span class="label">Nombre:</span>
          <span>{{ usuario.nombre }} {{ usuario.apellidos }}</span>
        </div>
        <div class="info-row">
          <span class="label">Email:</span>
          <span>{{ usuario.email }}</span>
        </div>
        <div class="info-row">
          <span class="label">Rol:</span>
          <span :class="['rol-badge', usuario.rol]">{{
            formatearRol(usuario.rol)
          }}</span>
        </div>
        <div class="info-row">
          <span class="label">Último acceso:</span>
          <span>{{ formatearFecha(usuario.ultimo_acceso) }}</span>
        </div>
        <div class="info-row">
          <span class="label">Miembro desde:</span>
          <span>{{ formatearFecha(usuario.fecha_creacion) }}</span>
        </div>
        <div class="info-row">
          <span class="label">Estado:</span>
          <span :class="['status-badge', usuario.activo ? 'activo' : 'inactivo']">
            {{ usuario.activo ? "Activo" : "Inactivo" }}
          </span>
        </div>
      </div>
      
      <div class="perfil-actions">
        <button @click="mostrarEditarPerfil = true" class="btn-edit-profile">
          ✏️ Editar Perfil
        </button>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="seccion-card">
      <h2>📊 Mis Estadísticas</h2>
      <div v-if="cargandoEstadisticas" class="loading">
        <p>🔄 Cargando estadísticas...</p>
      </div>
      <div v-else class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ estadisticas.animales_creados }}</div>
          <div class="stat-label">Animales Registrados</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ estadisticas.incidencias_creadas }}</div>
          <div class="stat-label">Incidencias Reportadas</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ estadisticas.eventos_creados }}</div>
          <div class="stat-label">Eventos Creados</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ estadisticas.tratamientos_administrados }}</div>
          <div class="stat-label">Tratamientos Aplicados</div>
        </div>
      </div>
    </div>

    <!-- Gestión de usuarios (solo admin) -->
    <div v-if="usuario.rol === 'admin'" class="seccion-card">
      <h2>👥 Gestión de Usuarios</h2>
      <div v-if="cargandoUsuarios" class="loading">
        <p>🔄 Cargando usuarios...</p>
      </div>
      <div v-else>
        <div class="usuarios-lista">
          <div v-for="u in usuarios" :key="u.id" class="usuario-item">
            <div class="usuario-info">
              <h4>{{ u.nombre }} {{ u.apellidos }}</h4>
              <p>{{ u.email }}</p>
              <span :class="['rol-badge', u.rol]">{{ formatearRol(u.rol) }}</span>
            </div>
            <div class="usuario-actions">
              <span :class="['status-badge', u.activo ? 'activo' : 'inactivo']">
                {{ u.activo ? "Activo" : "Inactivo" }}
              </span>
              <button
                @click="toggleUsuario(u)"
                :class="['btn-toggle', u.activo ? 'desactivar' : 'activar']"
                :disabled="u.id === usuario.id"
              >
                {{ u.activo ? "Desactivar" : "Activar" }}
              </button>
              <button
                @click="eliminarUsuario(u)"
                class="btn-delete-user"
                :disabled="u.id === usuario.id"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <button @click="mostrarModalUsuario = true" class="btn-add-user">
          + Agregar Usuario
        </button>
      </div>
    </div>

    <!-- Configuraciones -->
    <div class="seccion-card">
      <h2>🔧 Configuraciones</h2>
      <div class="configuraciones">
        <div class="config-item">
          <div class="config-info">
            <h4>Notificaciones del Navegador</h4>
            <p>Recibir alertas de eventos importantes</p>
          </div>
          <label class="switch">
            <input 
              type="checkbox" 
              v-model="configuraciones.notificaciones"
              @change="guardarConfiguraciones"
            />
            <span class="slider"></span>
          </label>
        </div>

        <div class="config-item">
          <div class="config-info">
            <h4>Auto-refresh</h4>
            <p>Actualizar datos automáticamente cada 30 segundos</p>
          </div>
          <label class="switch">
            <input 
              type="checkbox" 
              v-model="configuraciones.autoRefresh"
              @change="guardarConfiguraciones"
            />
            <span class="slider"></span>
          </label>
        </div>

        <div class="config-item">
          <div class="config-info">
            <h4>Sonidos</h4>
            <p>Reproducir sonidos para notificaciones</p>
          </div>
          <label class="switch">
            <input 
              type="checkbox" 
              v-model="configuraciones.sonidos"
              @change="guardarConfiguraciones"
            />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>

    <!-- Información del sistema -->
    <div class="seccion-card">
      <h2>ℹ️ Información del Sistema</h2>
      <div class="sistema-info">
        <div class="info-row">
          <span class="label">Versión:</span>
          <span>Genetics v1.0.0</span>
        </div>
        <div class="info-row">
          <span class="label">Estado del servidor:</span>
          <span :class="['status-dot', estadoServidor]">
            {{ estadoServidor === "online" ? "🟢 En línea" : "🔴 Desconectado" }}
          </span>
        </div>
        <div class="info-row">
          <span class="label">WebSocket:</span>
          <span :class="['status-dot', estadoWebSocket ? 'online' : 'offline']">
            {{ estadoWebSocket ? "🟢 Conectado" : "🔴 Desconectado" }}
          </span>
        </div>
        <div class="info-row">
          <span class="label">Total animales:</span>
          <span>{{ totalAnimales }}</span>
        </div>
        <div class="info-row">
          <span class="label">Total usuarios:</span>
          <span>{{ totalUsuarios }}</span>
        </div>
        <div class="info-row">
          <span class="label">Última sincronización:</span>
          <span>{{ ultimaSync }}</span>
        </div>
      </div>
    </div>

    <!-- Logs del sistema (solo admin) -->
    <div v-if="usuario.rol === 'admin'" class="seccion-card">
      <h2>📋 Logs del Sistema</h2>
      <div v-if="cargandoLogs" class="loading">
        <p>🔄 Cargando logs...</p>
      </div>
      <div v-else>
        <div class="logs-filtros">
          <select v-model="filtroTipoAccion" @change="cargarLogs">
            <option value="">Todas las acciones</option>
            <option value="crear">Crear</option>
            <option value="editar">Editar</option>
            <option value="eliminar">Eliminar</option>
          </select>
          <select v-model="filtroEntidad" @change="cargarLogs">
            <option value="">Todas las entidades</option>
            <option value="animal">Animales</option>
            <option value="incidencia">Incidencias</option>
            <option value="tratamiento">Tratamientos</option>
            <option value="evento">Eventos</option>
          </select>
        </div>
        
        <div class="logs-lista">
          <div v-for="log in logs.slice(0, 10)" :key="log.id" class="log-item">
            <div class="log-icon">
              {{ getLogIcon(log.tipo_accion) }}
            </div>
            <div class="log-content">
              <div class="log-header">
                <span class="log-action">{{ log.tipo_accion }}</span>
                <span class="log-entity">{{ log.entidad_afectada }}</span>
                <span class="log-time">{{ formatearFecha(log.fecha_hora) }}</span>
              </div>
              <div class="log-details">
                <span>Usuario: {{ obtenerNombreUsuario(log.usuario) }}</span>
                <span v-if="log.observaciones">{{ log.observaciones }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button @click="verTodosLogs" class="btn-view-logs">
          Ver Todos los Logs
        </button>
      </div>
    </div>

    <!-- Acciones -->
    <div class="seccion-card">
      <h2>⚡ Acciones</h2>
      <div class="acciones-grid">
        <button @click="mostrarCambiarPassword = true" class="btn-action">
          🔐 Cambiar Contraseña
        </button>
        <button @click="exportarDatos" class="btn-action" :disabled="exportando">
          {{ exportando ? '📤 Exportando...' : '📥 Exportar Datos' }}
        </button>
        <button @click="verificarConexion" class="btn-action" :disabled="verificandoConexion">
          {{ verificandoConexion ? '🔍 Verificando...' : '🔍 Verificar Sistema' }}
        </button>
        <button @click="limpiarCache" class="btn-action">
          🧹 Limpiar Caché
        </button>
        <button @click="cerrarSesion" class="btn-logout">
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>

    <!-- Modal para editar perfil -->
    <div v-if="mostrarEditarPerfil" class="modal-overlay" @click="cerrarModalPerfil">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Editar Perfil</h2>
          <button @click="cerrarModalPerfil" class="btn-close">×</button>
        </div>

        <form @submit.prevent="actualizarPerfil" class="perfil-form">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre *</label>
              <input v-model="formPerfil.nombre" type="text" required />
            </div>
            <div class="form-group">
              <label>Apellidos *</label>
              <input v-model="formPerfil.apellidos" type="text" required />
            </div>
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input v-model="formPerfil.email" type="email" required />
          </div>

          <div class="form-actions">
            <button type="button" @click="cerrarModalPerfil" class="btn-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn-save" :disabled="guardandoPerfil">
              {{ guardandoPerfil ? "Guardando..." : "Guardar" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para cambiar contraseña -->
    <div v-if="mostrarCambiarPassword" class="modal-overlay" @click="cerrarModalPassword">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Cambiar Contraseña</h2>
          <button @click="cerrarModalPassword" class="btn-close">×</button>
        </div>

        <form @submit.prevent="cambiarPassword" class="password-form">
          <div class="form-group">
            <label>Contraseña Actual *</label>
            <input v-model="formPassword.actual" type="password" required />
          </div>

          <div class="form-group">
            <label>Nueva Contraseña *</label>
            <input v-model="formPassword.nueva" type="password" required minlength="6" />
          </div>

          <div class="form-group">
            <label>Confirmar Nueva Contraseña *</label>
            <input v-model="formPassword.confirmar" type="password" required />
          </div>

          <div class="form-actions">
            <button type="button" @click="cerrarModalPassword" class="btn-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn-save" :disabled="cambiandoPassword">
              {{ cambiandoPassword ? "Cambiando..." : "Cambiar Contraseña" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para agregar usuario -->
    <div v-if="mostrarModalUsuario" class="modal-overlay" @click="cerrarModalUsuario">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Nuevo Usuario</h2>
          <button @click="cerrarModalUsuario" class="btn-close">×</button>
        </div>

        <form @submit.prevent="crearUsuario" class="usuario-form">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre *</label>
              <input v-model="formUsuario.nombre" type="text" required />
            </div>
            <div class="form-group">
              <label>Apellidos *</label>
              <input v-model="formUsuario.apellidos" type="text" required />
            </div>
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input v-model="formUsuario.email" type="email" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Contraseña *</label>
              <input v-model="formUsuario.password" type="password" required minlength="6" />
            </div>
            <div class="form-group">
              <label>Rol *</label>
              <select v-model="formUsuario.rol" required>
                <option value="">Seleccionar rol</option>
                <option value="admin">Administrador</option>
                <option value="usuario">Usuario</option>
                <option value="dueño">Dueño</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="cerrarModalUsuario" class="btn-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn-save" :disabled="creandoUsuario">
              {{ creandoUsuario ? "Creando..." : "Crear Usuario" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import { useNotifications } from "../composables/useWebSocket";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const { isConnected: estadoWebSocket } = useNotifications();
const { user: usuarioAuth, logout: logoutAuth } = useAuth();

// Estados reactivos
const usuario = ref({
  id: null,
  nombre: "",
  apellidos: "",
  email: "",
  rol: "",
  ultimo_acceso: "",
  fecha_creacion: "",
  activo: true,
});

const estadisticas = ref({
  animales_creados: 0,
  incidencias_creadas: 0,
  eventos_creados: 0,
  tratamientos_administrados: 0,
});

const usuarios = ref([]);
const logs = ref([]);
const totalAnimales = ref(0);
const totalUsuarios = ref(0);
const estadoServidor = ref("online");
const ultimaSync = ref("");

const configuraciones = ref({
  notificaciones: true,
  autoRefresh: false,
  sonidos: true,
});

// Estados de carga
const cargandoEstadisticas = ref(false);
const cargandoUsuarios = ref(false);
const cargandoLogs = ref(false);
const exportando = ref(false);
const verificandoConexion = ref(false);

// Modales
const mostrarEditarPerfil = ref(false);
const mostrarCambiarPassword = ref(false);
const mostrarModalUsuario = ref(false);

// Formularios
const formPerfil = ref({
  nombre: "",
  apellidos: "",
  email: "",
});

const formPassword = ref({
  actual: "",
  nueva: "",
  confirmar: "",
});

const formUsuario = ref({
  nombre: "",
  apellidos: "",
  email: "",
  password: "",
  rol: "",
});

// Estados de guardado
const guardandoPerfil = ref(false);
const cambiandoPassword = ref(false);
const creandoUsuario = ref(false);

// Filtros de logs
const filtroTipoAccion = ref("");
const filtroEntidad = ref("");

// Computed
const usuarioAutenticado = computed(() => {
  const userData = localStorage.getItem("user");
  if (userData) {
    const user = JSON.parse(userData);
    return user;
  }
  return null;
});

// Métodos principales
const cargarDatosUsuario = async () => {
  try {
    // Intentar obtener datos actualizados del servidor
    const response = await api.get("/auth/mi-perfil/");
    usuario.value = response.data;
    
    // Actualizar localStorage con datos frescos
    localStorage.setItem("user", JSON.stringify(response.data));
    
    // Inicializar formulario de perfil
    formPerfil.value = {
      nombre: usuario.value.nombre,
      apellidos: usuario.value.apellidos,
      email: usuario.value.email,
    };

  } catch (error) {
    console.error("Error cargando datos del usuario:", error);
    
    // Fallback a localStorage si falla la API
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      usuario.value = {
        id: user.id,
        nombre: user.nombre || "Usuario",
        apellidos: user.apellidos || "Demo",
        email: user.email || "demo@genetics.com",
        rol: user.rol || "admin",
        ultimo_acceso: user.ultimo_acceso || new Date().toISOString(),
        fecha_creacion: user.fecha_creacion || "2024-01-01T00:00:00Z",
        activo: user.activo !== undefined ? user.activo : true,
      };
      
      formPerfil.value = {
        nombre: usuario.value.nombre,
        apellidos: usuario.value.apellidos,
        email: usuario.value.email,
      };
    }
  }
};

const cargarEstadisticas = async () => {
  cargandoEstadisticas.value = true;
  try {
    // Intentar usar la API específica de estadísticas del usuario
    try {
      const statsResponse = await api.get("/auth/mis-estadisticas/");
      estadisticas.value = statsResponse.data;
    } catch (statsError) {
      console.warn("Error con API de estadísticas, usando método alternativo:", statsError);
      
      // Fallback: cargar datos generales y filtrar
      const [animalesRes, incidenciasRes, eventosRes, tratamientosRes] = await Promise.all([
        api.get("/animales/").catch(() => ({ data: [] })),
        api.get("/incidencias/").catch(() => ({ data: [] })),
        api.get("/eventos/").catch(() => ({ data: [] })),
        api.get("/tratamientos/").catch(() => ({ data: [] })),
      ]);

      const animales = Array.isArray(animalesRes.data) ? animalesRes.data : [];
      const incidencias = Array.isArray(incidenciasRes.data) ? incidenciasRes.data : [];
      const eventos = Array.isArray(eventosRes.data) ? eventosRes.data : [];
      const tratamientos = Array.isArray(tratamientosRes.data) ? tratamientosRes.data : [];

      estadisticas.value = {
        animales_creados: animales.filter(a => a.creado_por === usuario.value.id).length || animales.length,
        incidencias_creadas: incidencias.filter(i => i.creado_por === usuario.value.id).length || incidencias.length,
        eventos_creados: eventos.filter(e => e.creado_por === usuario.value.id).length || eventos.length,
        tratamientos_administrados: tratamientos.filter(t => t.administrado_por === usuario.value.id).length || tratamientos.length,
      };

      totalAnimales.value = animales.length;
    }
    
    ultimaSync.value = new Date().toLocaleString();

  } catch (error) {
    console.error("Error cargando estadísticas:", error);
    // Valores por defecto en caso de error total
    estadisticas.value = {
      animales_creados: 0,
      incidencias_creadas: 0,
      eventos_creados: 0,
      tratamientos_administrados: 0,
    };
  } finally {
    cargandoEstadisticas.value = false;
  }
};

const cargarUsuarios = async () => {
  if (usuario.value.rol !== "admin") return;

  cargandoUsuarios.value = true;
  try {
    const response = await api.get("/auth/");
    usuarios.value = Array.isArray(response.data) ? response.data : [];
    totalUsuarios.value = usuarios.value.length;
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    usuarios.value = [];
  } finally {
    cargandoUsuarios.value = false;
  }
};

const cargarLogs = async () => {
  if (usuario.value.rol !== "admin") return;

  cargandoLogs.value = true;
  try {
    let url = "/logs/";
    const params = new URLSearchParams();
    
    if (filtroTipoAccion.value) {
      params.append("tipo_accion", filtroTipoAccion.value);
    }
    if (filtroEntidad.value) {
      params.append("entidad_afectada", filtroEntidad.value);
    }
    
    if (params.toString()) {
      url += "?" + params.toString();
    }

    const response = await api.get(url);
    logs.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error cargando logs:", error);
    logs.value = [];
  } finally {
    cargandoLogs.value = false;
  }
};

// Métodos de utilidad
const formatearRol = (rol) => {
  const roles = {
    admin: "Administrador",
    usuario: "Usuario",
    dueño: "Dueño",
  };
  return roles[rol] || rol;
};

const formatearFecha = (fecha) => {
  if (!fecha) return "No disponible";
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const obtenerNombreUsuario = (usuarioId) => {
  const user = usuarios.value.find(u => u.id === usuarioId);
  return user ? `${user.nombre} ${user.apellidos}` : "Usuario no encontrado";
};

const getLogIcon = (tipoAccion) => {
  const icons = {
    crear: "➕",
    editar: "✏️",
    eliminar: "🗑️",
    subir_imagen: "📷",
    login: "🔑",
  };
  return icons[tipoAccion] || "📝";
};

// Acciones de usuarios
const toggleUsuario = async (u) => {
  if (!confirm(`¿Estás seguro de ${u.activo ? "desactivar" : "activar"} este usuario?`)) return;

  try {
    const response = await api.put(`/auth/${u.id}/`, {
      ...u,
      activo: !u.activo,
    });

    const index = usuarios.value.findIndex(user => user.id === u.id);
    usuarios.value[index] = response.data;

    alert(`Usuario ${u.activo ? "desactivado" : "activado"} correctamente`);
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    alert("Error al actualizar el usuario");
  }
};

const eliminarUsuario = async (u) => {
  if (!confirm(`¿Estás seguro de eliminar al usuario ${u.nombre} ${u.apellidos}?`)) return;

  try {
    await api.delete(`/auth/${u.id}/`);
    usuarios.value = usuarios.value.filter(user => user.id !== u.id);
    totalUsuarios.value = usuarios.value.length;
    alert("Usuario eliminado correctamente");
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    alert("Error al eliminar el usuario");
  }
};

const crearUsuario = async () => {
  creandoUsuario.value = true;

  try {
    const response = await api.post("/auth/register/", formUsuario.value);
    usuarios.value.push(response.data.user || response.data);
    totalUsuarios.value = usuarios.value.length;

    cerrarModalUsuario();
    alert("Usuario creado correctamente");
  } catch (error) {
    console.error("Error creando usuario:", error);
    alert("Error al crear el usuario");
  } finally {
    creandoUsuario.value = false;
  }
};

// Actualizar perfil
const actualizarPerfil = async () => {
  guardandoPerfil.value = true;

  try {
    const response = await api.put("/auth/actualizar-perfil/", formPerfil.value);
    
    // Actualizar datos locales con la respuesta del servidor
    if (response.data.user) {
      usuario.value = { ...usuario.value, ...response.data.user };
      localStorage.setItem("user", JSON.stringify(usuario.value));
    }

    cerrarModalPerfil();
    alert("✅ Perfil actualizado correctamente");
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    const errorMsg = error.response?.data?.error || "Error al actualizar el perfil";
    alert(`❌ ${errorMsg}`);
  } finally {
    guardandoPerfil.value = false;
  }
};

// Cambiar contraseña
const cambiarPassword = async () => {
  if (formPassword.value.nueva !== formPassword.value.confirmar) {
    alert("❌ Las contraseñas no coinciden");
    return;
  }

  if (formPassword.value.nueva.length < 6) {
    alert("❌ La nueva contraseña debe tener al menos 6 caracteres");
    return;
  }

  cambiandoPassword.value = true;

  try {
    await api.post("/auth/change-password/", {
      old_password: formPassword.value.actual,
      new_password: formPassword.value.nueva,
    });

    cerrarModalPassword();
    alert("✅ Contraseña cambiada correctamente");
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    const errorMsg = error.response?.data?.error || "Error al cambiar la contraseña";
    alert(`❌ ${errorMsg}`);
  } finally {
    cambiandoPassword.value = false;
  }
};

// Acciones del sistema
const guardarConfiguraciones = () => {
  localStorage.setItem("configuraciones", JSON.stringify(configuraciones.value));
  
  // Aplicar configuraciones
  if (configuraciones.value.notificaciones) {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }
  
  alert("Configuraciones guardadas");
};

const cargarConfiguraciones = () => {
  try {
    const saved = localStorage.getItem("configuraciones");
    if (saved) {
      configuraciones.value = { ...configuraciones.value, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error("Error cargando configuraciones:", error);
  }
};

const verificarConexion = async () => {
  verificandoConexion.value = true;
  
  try {
    await api.get("/health/");
    estadoServidor.value = "online";
    alert("✅ Conexión verificada correctamente");
  } catch (error) {
    estadoServidor.value = "offline";
    alert("❌ Error de conexión con el servidor");
  } finally {
    verificandoConexion.value = false;
  }
};

const exportarDatos = async () => {
  exportando.value = true;
  
  try {
    // Simular exportación (aquí implementarías la lógica real)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const data = {
      usuario: usuario.value,
      estadisticas: estadisticas.value,
      fecha_exportacion: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genetics_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert("✅ Datos exportados correctamente");
  } catch (error) {
    console.error("Error exportando datos:", error);
    alert("❌ Error al exportar los datos");
  } finally {
    exportando.value = false;
  }
};

const limpiarCache = () => {
  if (confirm("¿Estás seguro de limpiar la caché? Esto recargará la página.")) {
    localStorage.removeItem("configuraciones");
    sessionStorage.clear();
    if ("caches" in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    window.location.reload();
  }
};

const verTodosLogs = () => {
  // Implementar vista completa de logs
  alert("Funcionalidad de vista completa de logs en desarrollo");
};

const cerrarSesion = async () => {
  await logoutAuth(true); // true para mostrar confirmación
};

// Cerrar modales
const cerrarModalPerfil = () => {
  mostrarEditarPerfil.value = false;
  formPerfil.value = {
    nombre: usuario.value.nombre,
    apellidos: usuario.value.apellidos,
    email: usuario.value.email,
  };
};

const cerrarModalPassword = () => {
  mostrarCambiarPassword.value = false;
  formPassword.value = {
    actual: "",
    nueva: "",
    confirmar: "",
  };
};

const cerrarModalUsuario = () => {
  mostrarModalUsuario.value = false;
  formUsuario.value = {
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    rol: "",
  };
};

// Auto-refresh
let autoRefreshInterval = null;

const configurarAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
  
  if (configuraciones.value.autoRefresh) {
    autoRefreshInterval = setInterval(async () => {
      await cargarEstadisticas();
      if (usuario.value.rol === "admin") {
        await cargarUsuarios();
        await cargarLogs();
      }
      ultimaSync.value = new Date().toLocaleString();
    }, 30000); // 30 segundos
  }
};

// Cargar datos al montar
onMounted(async () => {
  await cargarDatosUsuario();
  cargarConfiguraciones();
  await cargarEstadisticas();
  
  if (usuario.value.rol === "admin") {
    await cargarUsuarios();
    await cargarLogs();
  }
  
  configurarAutoRefresh();
});

// Limpiar intervalo al desmontar
import { onBeforeUnmount } from "vue";
onBeforeUnmount(() => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
});

// Watch para auto-refresh
import { watch } from "vue";
watch(() => configuraciones.value.autoRefresh, configurarAutoRefresh);
</script>

<style scoped>
.ajustes-page {
  padding: 1.5rem;
  padding-bottom: 5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: #2c3e50;
}

.seccion-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.seccion-card h2 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

/* Perfil */
.perfil-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #ecf0f1;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-weight: 600;
  color: #7f8c8d;
}

.rol-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.rol-badge.admin {
  background: #e8f6fd;
  color: #3498db;
}

.rol-badge.usuario {
  background: #d5f4e6;
  color: #27ae60;
}

.rol-badge.dueño {
  background: #fef9e7;
  color: #f39c12;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.activo {
  background: #d5f4e6;
  color: #27ae60;
}

.status-badge.inactivo {
  background: #fadbd8;
  color: #e74c3c;
}

.perfil-actions {
  display: flex;
  gap: 1rem;
}

.btn-edit-profile {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-edit-profile:hover {
  background: #2980b9;
}

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Usuarios */
.usuarios-lista {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.usuario-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.usuario-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
}

.usuario-info p {
  margin: 0 0 0.5rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.usuario-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-toggle {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-toggle.activar {
  background: #d5f4e6;
  color: #27ae60;
}

.btn-toggle.desactivar {
  background: #fadbd8;
  color: #e74c3c;
}

.btn-toggle:disabled {
  background: #ecf0f1;
  color: #95a5a6;
  cursor: not-allowed;
}

.btn-delete-user {
  background: #fadbd8;
  color: #e74c3c;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete-user:hover:not(:disabled) {
  background: #e74c3c;
  color: white;
}

.btn-delete-user:disabled {
  background: #ecf0f1;
  color: #95a5a6;
  cursor: not-allowed;
}

.btn-add-user {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-add-user:hover {
  background: #2980b9;
}

/* Configuraciones */
.configuraciones {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.config-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
}

.config-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #3498db;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Sistema info */
.sistema-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot.online {
  color: #27ae60;
}

.status-dot.offline {
  color: #e74c3c;
}

/* Logs */
.logs-filtros {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.logs-filtros select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.logs-lista {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px solid #f1f3f4;
}

.log-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.log-content {
  flex: 1;
}

.log-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.log-action {
  background: #3498db;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.log-entity {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.log-time {
  color: #7f8c8d;
  font-size: 0.8rem;
  margin-left: auto;
}

.log-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.btn-view-logs {
  background: #ecf0f1;
  color: #2c3e50;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-view-logs:hover {
  background: #bdc3c7;
}

/* Acciones */
.acciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.btn-action,
.btn-logout {
  padding: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-action {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-action:hover:not(:disabled) {
  background: #bdc3c7;
}

.btn-action:disabled {
  background: #f8f9fa;
  color: #95a5a6;
  cursor: not-allowed;
}

.btn-logout {
  background: #fadbd8;
  color: #e74c3c;
}

.btn-logout:hover {
  background: #e74c3c;
  color: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0.5rem;
}

.btn-close:hover {
  color: #2c3e50;
}

.perfil-form,
.password-form,
.usuario-form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cancel {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-cancel:hover {
  background: #bdc3c7;
}

.btn-save {
  background: #27ae60;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #229954;
}

.btn-save:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .ajustes-page {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .usuario-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .usuario-actions {
    width: 100%;
    justify-content: space-between;
  }

  .config-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .acciones-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .logs-filtros {
    flex-direction: column;
  }

  .log-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .log-time {
    margin-left: 0;
  }
}
</style>