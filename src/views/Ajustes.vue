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
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="seccion-card">
      <h2>📊 Mis Estadísticas</h2>
      <div class="stats-grid">
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
          <div class="stat-number">
            {{ estadisticas.tratamientos_administrados }}
          </div>
          <div class="stat-label">Tratamientos Aplicados</div>
        </div>
      </div>
    </div>

    <!-- Gestión de usuarios (solo admin) -->
    <div v-if="usuario.rol === 'admin'" class="seccion-card">
      <h2>👥 Gestión de Usuarios</h2>
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
            >
              {{ u.activo ? "Desactivar" : "Activar" }}
            </button>
          </div>
        </div>
      </div>

      <button @click="mostrarModalUsuario = true" class="btn-add-user">
        + Agregar Usuario
      </button>
    </div>

    <!-- Configuraciones -->
    <div class="seccion-card">
      <h2>🔧 Configuraciones</h2>
      <div class="configuraciones">
        <div class="config-item">
          <div class="config-info">
            <h4>Notificaciones</h4>
            <p>Recibir alertas de eventos importantes</p>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="configuraciones.notificaciones" />
            <span class="slider"></span>
          </label>
        </div>

        <div class="config-item">
          <div class="config-info">
            <h4>Recordatorios</h4>
            <p>Enviar recordatorios de tratamientos y visitas</p>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="configuraciones.recordatorios" />
            <span class="slider"></span>
          </label>
        </div>

        <div class="config-item">
          <div class="config-info">
            <h4>Modo Oscuro</h4>
            <p>Cambiar la apariencia de la aplicación</p>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="configuraciones.modoOscuro" />
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
          <span :class="['status-dot', estadoServidor]">{{
            estadoServidor === "online" ? "En línea" : "Desconectado"
          }}</span>
        </div>
        <div class="info-row">
          <span class="label">Total animales:</span>
          <span>{{ totalAnimales }}</span>
        </div>
        <div class="info-row">
          <span class="label">Total usuarios:</span>
          <span>{{ totalUsuarios }}</span>
        </div>
      </div>
    </div>

    <!-- Acciones -->
    <div class="seccion-card">
      <h2>⚡ Acciones</h2>
      <div class="acciones-grid">
        <button @click="cambiarPassword" class="btn-action">
          🔐 Cambiar Contraseña
        </button>
        <button @click="exportarDatos" class="btn-action">
          📥 Exportar Datos
        </button>
        <button
          @click="verLogs"
          class="btn-action"
          v-if="usuario.rol === 'admin'"
        >
          📋 Ver Logs
        </button>
        <button @click="cerrarSesion" class="btn-logout">
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>

    <!-- Modal para agregar usuario -->
    <div
      v-if="mostrarModalUsuario"
      class="modal-overlay"
      @click="cerrarModalUsuario"
    >
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
              <input v-model="formUsuario.password" type="password" required />
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
            <button
              type="button"
              @click="cerrarModalUsuario"
              class="btn-cancel"
            >
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const router = useRouter();

// Estados reactivos
const usuario = ref({
  nombre: "",
  apellidos: "",
  email: "",
  rol: "",
  ultimo_acceso: "",
  fecha_creacion: "",
});

const estadisticas = ref({
  animales_creados: 0,
  incidencias_creadas: 0,
  eventos_creados: 0,
  tratamientos_administrados: 0,
});

const usuarios = ref([]);
const totalAnimales = ref(0);
const totalUsuarios = ref(0);
const estadoServidor = ref("online");
const mostrarModalUsuario = ref(false);
const creandoUsuario = ref(false);

const configuraciones = ref({
  notificaciones: true,
  recordatorios: true,
  modoOscuro: false,
});

const formUsuario = ref({
  nombre: "",
  apellidos: "",
  email: "",
  password: "",
  rol: "",
});

// Métodos
const cargarDatosUsuario = async () => {
  try {
    // Simular datos del usuario actual (normalmente vendrían del token JWT)
    usuario.value = {
      nombre: "Usuario",
      apellidos: "Demo",
      email: "demo@genetics.com",
      rol: "admin",
      ultimo_acceso: new Date().toISOString(),
      fecha_creacion: "2024-01-01T00:00:00Z",
    };
  } catch (error) {
    console.error("Error cargando datos del usuario:", error);
  }
};

const cargarEstadisticas = async () => {
  try {
    // Cargar estadísticas básicas
    const [animalesRes, incidenciasRes, eventosRes, tratamientosRes] =
      await Promise.all([
        api.get("/animales/"),
        api.get("/incidencias/"),
        api.get("/eventos/"),
        api.get("/tratamientos/"),
      ]);

    estadisticas.value = {
      animales_creados: animalesRes.data.length,
      incidencias_creadas: incidenciasRes.data.length,
      eventos_creados: eventosRes.data.length,
      tratamientos_administrados: tratamientosRes.data.length,
    };

    totalAnimales.value = animalesRes.data.length;
  } catch (error) {
    console.error("Error cargando estadísticas:", error);
  }
};

const cargarUsuarios = async () => {
  if (usuario.value.rol !== "admin") return;

  try {
    const response = await api.get("/auth/");
    usuarios.value = response.data;
    totalUsuarios.value = response.data.length;
  } catch (error) {
    console.error("Error cargando usuarios:", error);
  }
};

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

const toggleUsuario = async (u) => {
  if (
    !confirm(
      `¿Estás seguro de ${u.activo ? "desactivar" : "activar"} este usuario?`,
    )
  )
    return;

  try {
    const response = await api.put(`/auth/${u.id}/`, {
      ...u,
      activo: !u.activo,
    });

    const index = usuarios.value.findIndex((user) => user.id === u.id);
    usuarios.value[index] = response.data;

    alert(`Usuario ${u.activo ? "desactivado" : "activado"} correctamente`);
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    alert("Error al actualizar el usuario");
  }
};

const crearUsuario = async () => {
  creandoUsuario.value = true;

  try {
    const response = await api.post("/auth/register/", formUsuario.value);
    usuarios.value.push(response.data);
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

const cambiarPassword = () => {
  alert("Funcionalidad de cambio de contraseña en desarrollo");
};

const exportarDatos = () => {
  alert("Funcionalidad de exportación en desarrollo");
};

const verLogs = () => {
  alert("Funcionalidad de logs en desarrollo");
};

const cerrarSesion = () => {
  if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
    localStorage.removeItem("token");
    router.push("/login");
  }
};

// Cargar datos al montar
onMounted(() => {
  cargarDatosUsuario();
  cargarEstadisticas();
  cargarUsuarios();
});
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

/* Perfil */
.perfil-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.status-dot::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #27ae60;
}

.status-dot.offline::before {
  background: #e74c3c;
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

.btn-action:hover {
  background: #bdc3c7;
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

.btn-save:hover {
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
}
</style>
