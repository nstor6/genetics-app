<template>
  <div class="incidencias-page">
    <div class="page-header">
      <h1>🚨 Gestión de Incidencias</h1>
      <button @click="mostrarModalIncidencia = true" class="btn-primary">
        + Nueva Incidencia
      </button>
    </div>

    <!-- Filtros -->
    <div class="filtros-section">
      <div class="filtros-row">
        <input
          v-model="busqueda"
          type="text"
          placeholder="🔍 Buscar por animal o tipo..."
          class="search-input"
        />

        <select v-model="filtroEstado" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en tratamiento">En tratamiento</option>
          <option value="resuelto">Resuelto</option>
        </select>

        <select v-model="filtroTipo" class="filter-select">
          <option value="">Todos los tipos</option>
          <option value="enfermedad">Enfermedad</option>
          <option value="herida">Herida</option>
          <option value="comportamiento">Comportamiento</option>
          <option value="otro">Otro</option>
        </select>
      </div>
    </div>

    <!-- Lista de incidencias -->
    <div class="incidencias-grid" v-if="incidenciasFiltradas.length > 0">
      <div
        v-for="incidencia in incidenciasFiltradas"
        :key="incidencia.id"
        :class="['incidencia-card', `estado-${incidencia.estado}`]"
      >
        <div class="incidencia-header">
          <div class="incidencia-info">
            <h3>{{ incidencia.tipo }}</h3>
            <p class="animal-info">
              🐄 {{ obtenerNombreAnimal(incidencia.animal) }}
            </p>
            <span :class="['estado-badge', incidencia.estado]">
              {{ formatearEstado(incidencia.estado) }}
            </span>
          </div>
          <div class="incidencia-fecha">
            <span class="fecha-label">Detectada</span>
            <span class="fecha-valor">{{
              formatearFecha(incidencia.fecha_deteccion)
            }}</span>
          </div>
        </div>

        <div class="incidencia-descripcion">
          <p>{{ incidencia.descripcion }}</p>
        </div>

        <div class="incidencia-meta">
          <div class="meta-item">
            <span class="meta-label">Reportado por:</span>
            <span>{{ obtenerNombreUsuario(incidencia.reportado_por) }}</span>
          </div>
          <div class="meta-item" v-if="incidencia.fecha_resolucion">
            <span class="meta-label">Resuelto:</span>
            <span>{{ formatearFecha(incidencia.fecha_resolucion) }}</span>
          </div>
        </div>

        <div class="incidencia-actions">
          <button @click="editarIncidencia(incidencia)" class="btn-edit">
            ✏️ Editar
          </button>
          <button
            v-if="incidencia.estado !== 'resuelto'"
            @click="resolverIncidencia(incidencia)"
            class="btn-resolve"
          >
            ✅ Resolver
          </button>
          <button @click="eliminarIncidencia(incidencia)" class="btn-delete">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>

    <div v-else class="no-incidencias">
      <p>No se encontraron incidencias</p>
      <button @click="mostrarModalIncidencia = true" class="btn-add">
        + Agregar primera incidencia
      </button>
    </div>

    <!-- Modal crear/editar incidencia -->
    <div
      v-if="mostrarModalIncidencia"
      class="modal-overlay"
      @click="cerrarModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>
            {{ incidenciaEditando ? "Editar Incidencia" : "Nueva Incidencia" }}
          </h2>
          <button @click="cerrarModal" class="btn-close">×</button>
        </div>

        <form @submit.prevent="guardarIncidencia" class="incidencia-form">
          <div class="form-row">
            <div class="form-group">
              <label>Animal Afectado *</label>
              <select v-model="formIncidencia.animal" required>
                <option value="">Seleccionar animal</option>
                <option
                  v-for="animal in animales"
                  :key="animal.id"
                  :value="animal.id"
                >
                  {{ animal.chapeta }} - {{ animal.nombre || "Sin nombre" }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Tipo de Incidencia *</label>
              <select v-model="formIncidencia.tipo" required>
                <option value="">Seleccionar tipo</option>
                <option value="enfermedad">Enfermedad</option>
                <option value="herida">Herida</option>
                <option value="comportamiento anómalo">
                  Comportamiento anómalo
                </option>
                <option value="problema reproductivo">
                  Problema reproductivo
                </option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Descripción Detallada *</label>
            <textarea
              v-model="formIncidencia.descripcion"
              rows="4"
              required
              placeholder="Describe los síntomas, ubicación, gravedad, etc..."
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Fecha de Detección *</label>
              <input
                v-model="formIncidencia.fecha_deteccion"
                type="date"
                required
              />
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select v-model="formIncidencia.estado">
                <option value="pendiente">Pendiente</option>
                <option value="en tratamiento">En tratamiento</option>
                <option value="resuelto">Resuelto</option>
              </select>
            </div>
          </div>

          <div class="form-group" v-if="formIncidencia.estado === 'resuelto'">
            <label>Fecha de Resolución</label>
            <input v-model="formIncidencia.fecha_resolucion" type="date" />
          </div>

          <div class="form-actions">
            <button type="button" @click="cerrarModal" class="btn-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn-save" :disabled="guardando">
              {{ guardando ? "Guardando..." : "Guardar" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../services/api";

// Estados reactivos
const incidencias = ref([]);
const animales = ref([]);
const usuarios = ref([]);
const busqueda = ref("");
const filtroEstado = ref("");
const filtroTipo = ref("");
const mostrarModalIncidencia = ref(false);
const incidenciaEditando = ref(null);
const guardando = ref(false);

// Formulario de incidencia
const formIncidencia = ref({
  animal: "",
  tipo: "",
  descripcion: "",
  fecha_deteccion: new Date().toISOString().split("T")[0],
  estado: "pendiente",
  fecha_resolucion: "",
});

// Computed
const incidenciasFiltradas = computed(() => {
  let resultado = incidencias.value;

  // Filtro por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase();
    resultado = resultado.filter(
      (incidencia) =>
        incidencia.tipo.toLowerCase().includes(termino) ||
        incidencia.descripcion.toLowerCase().includes(termino) ||
        obtenerNombreAnimal(incidencia.animal).toLowerCase().includes(termino),
    );
  }

  // Filtro por estado
  if (filtroEstado.value) {
    resultado = resultado.filter(
      (incidencia) => incidencia.estado === filtroEstado.value,
    );
  }

  // Filtro por tipo
  if (filtroTipo.value) {
    resultado = resultado.filter((incidencia) =>
      incidencia.tipo.toLowerCase().includes(filtroTipo.value),
    );
  }

  if (Array.isArray(resultado)) {
  resultado.sort((a, b) => {
    // tu lógica de ordenación
  });
} else {
  console.error("❌ resultado no es un array:", resultado);
}


  return resultado.sort(
    (a, b) => new Date(b.fecha_deteccion) - new Date(a.fecha_deteccion),
  );
});

// Métodos
const cargarIncidencias = async () => {
  try {
    const response = await api.get("/incidencias/");
    incidencias.value = response.data;
  } catch (error) {
    console.error("Error cargando incidencias:", error);
    alert("Error al cargar las incidencias");
  }
};

const cargarAnimales = async () => {
  try {
    const response = await api.get("/animales/");
    animales.value = response.data;
  } catch (error) {
    console.error("Error cargando animales:", error);
  }
};

const cargarUsuarios = async () => {
  try {
    const response = await api.get("/auth/");
    usuarios.value = response.data;
  } catch (error) {
    console.error("Error cargando usuarios:", error);
  }
};

const obtenerNombreAnimal = (animalId) => {
  const animal = animales.value.find((a) => a.id === animalId);
  return animal
    ? `${animal.chapeta}${animal.nombre ? " - " + animal.nombre : ""}`
    : "Animal no encontrado";
};

const obtenerNombreUsuario = (usuarioId) => {
  const usuario = usuarios.value.find((u) => u.id === usuarioId);
  return usuario
    ? `${usuario.nombre} ${usuario.apellidos}`
    : "Usuario no encontrado";
};

const formatearEstado = (estado) => {
  const estados = {
    pendiente: "Pendiente",
    "en tratamiento": "En Tratamiento",
    resuelto: "Resuelto",
  };
  return estados[estado] || estado;
};

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const editarIncidencia = (incidencia) => {
  incidenciaEditando.value = incidencia;
  formIncidencia.value = {
    animal: incidencia.animal,
    tipo: incidencia.tipo,
    descripcion: incidencia.descripcion,
    fecha_deteccion: incidencia.fecha_deteccion,
    estado: incidencia.estado,
    fecha_resolucion: incidencia.fecha_resolucion || "",
  };
  mostrarModalIncidencia.value = true;
};

const resolverIncidencia = async (incidencia) => {
  if (!confirm("¿Marcar esta incidencia como resuelta?")) return;

  try {
    const response = await api.put(`/incidencias/${incidencia.id}/`, {
      ...incidencia,
      estado: "resuelto",
      fecha_resolucion: new Date().toISOString().split("T")[0],
    });

    const index = incidencias.value.findIndex((i) => i.id === incidencia.id);
    incidencias.value[index] = response.data;

    alert("Incidencia marcada como resuelta");
  } catch (error) {
    console.error("Error resolviendo incidencia:", error);
    alert("Error al resolver la incidencia");
  }
};

const eliminarIncidencia = async (incidencia) => {
  if (!confirm("¿Estás seguro de eliminar esta incidencia?")) return;

  try {
    await api.delete(`/incidencias/${incidencia.id}/`);
    incidencias.value = incidencias.value.filter((i) => i.id !== incidencia.id);
    alert("Incidencia eliminada correctamente");
  } catch (error) {
    console.error("Error eliminando incidencia:", error);
    alert("Error al eliminar la incidencia");
  }
};

const guardarIncidencia = async () => {
  guardando.value = true;

  try {
    // Preparar datos según el modelo de Django
    const datos = {
      animal: parseInt(formIncidencia.value.animal),
      tipo: formIncidencia.value.tipo,
      descripcion: formIncidencia.value.descripcion,
      fecha_deteccion: formIncidencia.value.fecha_deteccion,
      estado: formIncidencia.value.estado,
    };

    // Solo agregar fecha_resolucion si el estado es 'resuelto'
    if (
      formIncidencia.value.estado === "resuelto" &&
      formIncidencia.value.fecha_resolucion
    ) {
      datos.fecha_resolucion = formIncidencia.value.fecha_resolucion;
    }

    console.log("Enviando datos:", datos); // Para debugging

    if (incidenciaEditando.value) {
      // Actualizar incidencia existente
      const response = await api.put(
        `/incidencias/${incidenciaEditando.value.id}/`,
        datos,
      );
      const index = incidencias.value.findIndex(
        (i) => i.id === incidenciaEditando.value.id,
      );
      incidencias.value[index] = response.data;
    } else {
      // Crear nueva incidencia
      const response = await api.post("/incidencias/", datos);
      incidencias.value.unshift(response.data);
    }

    cerrarModal();
    alert("Incidencia guardada correctamente");
  } catch (error) {
    console.error("Error guardando incidencia:", error);
    console.error("Respuesta del servidor:", error.response?.data);

    // Mostrar error específico del servidor
    const errorMsg = error.response?.data
      ? JSON.stringify(error.response.data, null, 2)
      : "Error desconocido";
    alert(`Error al guardar: ${errorMsg}`);
  } finally {
    guardando.value = false;
  }
};

const cerrarModal = () => {
  mostrarModalIncidencia.value = false;
  incidenciaEditando.value = null;
  formIncidencia.value = {
    animal: "",
    tipo: "",
    descripcion: "",
    fecha_deteccion: new Date().toISOString().split("T")[0],
    estado: "pendiente",
    fecha_resolucion: "",
  };
};

// Cargar datos al montar
onMounted(() => {
  cargarIncidencias();
  cargarAnimales();
  cargarUsuarios();
});
</script>

<style scoped>
.incidencias-page {
  padding: 1.5rem;
  padding-bottom: 5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: #2c3e50;
}

.btn-primary {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #c0392b;
}

/* Filtros */
.filtros-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filtros-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
}

.search-input,
.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #e74c3c;
}

/* Grid de incidencias */
.incidencias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.incidencia-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e74c3c;
  transition: all 0.2s;
}

.incidencia-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.incidencia-card.estado-pendiente {
  border-left-color: #f39c12;
}

.incidencia-card.estado-en.tratamiento {
  border-left-color: #3498db;
}

.incidencia-card.estado-resuelto {
  border-left-color: #27ae60;
  opacity: 0.8;
}

.incidencia-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.incidencia-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.animal-info {
  margin: 0 0 0.5rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.estado-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.estado-badge.pendiente {
  background: #fef9e7;
  color: #f39c12;
}

.estado-badge.en.tratamiento {
  background: #e8f6fd;
  color: #3498db;
}

.estado-badge.resuelto {
  background: #d5f4e6;
  color: #27ae60;
}

.incidencia-fecha {
  text-align: right;
  font-size: 0.8rem;
}

.fecha-label {
  display: block;
  color: #7f8c8d;
  font-weight: 500;
}

.fecha-valor {
  display: block;
  color: #2c3e50;
  font-weight: 600;
}

.incidencia-descripcion {
  margin-bottom: 1rem;
}

.incidencia-descripcion p {
  margin: 0;
  color: #34495e;
  line-height: 1.5;
}

.incidencia-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.meta-label {
  font-weight: 500;
  color: #7f8c8d;
}

.incidencia-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-resolve,
.btn-delete {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-edit {
  background: #fef9e7;
  color: #f39c12;
}

.btn-edit:hover {
  background: #f39c12;
  color: white;
}

.btn-resolve {
  background: #d5f4e6;
  color: #27ae60;
}

.btn-resolve:hover {
  background: #27ae60;
  color: white;
}

.btn-delete {
  background: #fadbd8;
  color: #e74c3c;
}

.btn-delete:hover {
  background: #e74c3c;
  color: white;
}

.no-incidencias {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.btn-add {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 1rem;
}

.btn-add:hover {
  background: #c0392b;
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
  max-width: 600px;
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

.incidencia-form {
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #e74c3c;
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
  background: #e74c3c;
  color: white;
}

.btn-save:hover {
  background: #c0392b;
}

.btn-save:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .incidencias-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .filtros-row {
    grid-template-columns: 1fr;
  }

  .incidencias-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .incidencia-actions {
    flex-direction: column;
  }

  .incidencia-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
