<template>
  <div class="tratamientos-page">
    <div class="page-header">
      <h1>💊 Gestión de Tratamientos</h1>
      <button @click="mostrarModalTratamiento = true" class="btn-primary">
        + Nuevo Tratamiento
      </button>
    </div>

    <!-- Filtros -->
    <div class="filtros-section">
      <div class="filtros-row">
        <input
          v-model="busqueda"
          type="text"
          placeholder="🔍 Buscar por animal o medicamento..."
          class="search-input"
        />

        <select v-model="filtroMedicamento" class="filter-select">
          <option value="">Todos los medicamentos</option>
          <option v-for="med in medicamentosUnicos" :key="med" :value="med">
            {{ med }}
          </option>
        </select>

        <input
          v-model="filtroFecha"
          type="date"
          class="filter-select"
          title="Filtrar por fecha"
        />
      </div>
    </div>

    <!-- Lista de tratamientos -->
    <div class="tratamientos-grid" v-if="tratamientosFiltrados.length > 0">
      <div
        v-for="tratamiento in tratamientosFiltrados"
        :key="tratamiento.id"
        class="tratamiento-card"
      >
        <div class="tratamiento-header">
          <div class="medicamento-info">
            <h3>💊 {{ tratamiento.medicamento }}</h3>
            <p class="animal-info">
              🐄 {{ obtenerNombreAnimal(tratamiento.animal) }}
            </p>
          </div>
          <div class="tratamiento-fecha">
            <span class="fecha-valor">{{
              formatearFecha(tratamiento.fecha)
            }}</span>
          </div>
        </div>

        <div class="tratamiento-detalles">
          <div class="detalle-row">
            <span class="detalle-label">Dosis:</span>
            <span class="detalle-valor">{{ tratamiento.dosis }}</span>
          </div>
          <div class="detalle-row">
            <span class="detalle-label">Duración:</span>
            <span class="detalle-valor">{{ tratamiento.duracion }}</span>
          </div>
          <div class="detalle-row" v-if="tratamiento.administrado_por">
            <span class="detalle-label">Administrado por:</span>
            <span class="detalle-valor">{{
              obtenerNombreUsuario(tratamiento.administrado_por)
            }}</span>
          </div>
        </div>

        <div v-if="tratamiento.observaciones" class="tratamiento-observaciones">
          <p><strong>Observaciones:</strong> {{ tratamiento.observaciones }}</p>
        </div>

        <div class="tratamiento-actions">
          <button @click="editarTratamiento(tratamiento)" class="btn-edit">
            ✏️ Editar
          </button>
          <button
            @click="duplicarTratamiento(tratamiento)"
            class="btn-duplicate"
          >
            📋 Duplicar
          </button>
          <button @click="eliminarTratamiento(tratamiento)" class="btn-delete">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>

    <div v-else class="no-tratamientos">
      <p>No se encontraron tratamientos</p>
      <button @click="mostrarModalTratamiento = true" class="btn-add">
        + Agregar primer tratamiento
      </button>
    </div>

    <!-- Modal crear/editar tratamiento -->
    <div
      v-if="mostrarModalTratamiento"
      class="modal-overlay"
      @click="cerrarModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>
            {{
              tratamientoEditando ? "Editar Tratamiento" : "Nuevo Tratamiento"
            }}
          </h2>
          <button @click="cerrarModal" class="btn-close">×</button>
        </div>

        <form @submit.prevent="guardarTratamiento" class="tratamiento-form">
          <div class="form-row">
            <div class="form-group">
              <label>Animal *</label>
              <select v-model="formTratamiento.animal" required>
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
              <label>Fecha del Tratamiento *</label>
              <input v-model="formTratamiento.fecha" type="date" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Medicamento *</label>
              <input
                v-model="formTratamiento.medicamento"
                type="text"
                required
                placeholder="Ej: Penicilina, Ivermectina..."
                list="medicamentos-list"
              />
              <datalist id="medicamentos-list">
                <option
                  v-for="med in medicamentosComunes"
                  :key="med"
                  :value="med"
                ></option>
              </datalist>
            </div>
            <div class="form-group">
              <label>Dosis *</label>
              <input
                v-model="formTratamiento.dosis"
                type="text"
                required
                placeholder="Ej: 10ml, 2 comprimidos..."
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Duración del Tratamiento *</label>
              <input
                v-model="formTratamiento.duracion"
                type="text"
                required
                placeholder="Ej: 5 días, 1 semana..."
              />
            </div>
            <div class="form-group">
              <label>Administrado por</label>
              <select v-model="formTratamiento.administrado_por">
                <option value="">Seleccionar usuario</option>
                <option
                  v-for="usuario in usuarios"
                  :key="usuario.id"
                  :value="usuario.id"
                >
                  {{ usuario.nombre }} {{ usuario.apellidos }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Observaciones</label>
            <textarea
              v-model="formTratamiento.observaciones"
              rows="3"
              placeholder="Notas adicionales sobre el tratamiento..."
            ></textarea>
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
const tratamientos = ref([]);
const animales = ref([]);
const usuarios = ref([]);
const busqueda = ref("");
const filtroMedicamento = ref("");
const filtroFecha = ref("");
const mostrarModalTratamiento = ref(false);
const tratamientoEditando = ref(null);
const guardando = ref(false);

// Formulario de tratamiento
const formTratamiento = ref({
  animal: "",
  fecha: new Date().toISOString().split("T")[0],
  medicamento: "",
  dosis: "",
  duracion: "",
  administrado_por: "",
  observaciones: "",
});

// Medicamentos comunes para autocompletado
const medicamentosComunes = [
  "Penicilina",
  "Oxitetraciclina",
  "Ivermectina",
  "Vitamina B12",
  "Hierro Dextrano",
  "Vacuna Brucelosis",
  "Vacuna Fiebre Aftosa",
  "Desparasitante",
  "Antiinflamatorio",
  "Antibiótico",
];

// Computed
const medicamentosUnicos = computed(() => {
  const meds = [...new Set(tratamientos.value.map((t) => t.medicamento))];
  return meds.sort();
});

const tratamientosFiltrados = computed(() => {
  let resultado = tratamientos.value;

  // Filtro por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase();
    resultado = resultado.filter(
      (tratamiento) =>
        tratamiento.medicamento.toLowerCase().includes(termino) ||
        obtenerNombreAnimal(tratamiento.animal)
          .toLowerCase()
          .includes(termino) ||
        (tratamiento.observaciones &&
          tratamiento.observaciones.toLowerCase().includes(termino)),
    );
  }

  // Filtro por medicamento
  if (filtroMedicamento.value) {
    resultado = resultado.filter(
      (tratamiento) => tratamiento.medicamento === filtroMedicamento.value,
    );
  }

  // Filtro por fecha
  if (filtroFecha.value) {
    resultado = resultado.filter(
      (tratamiento) => tratamiento.fecha === filtroFecha.value,
    );
  }

  return resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

// Métodos
const cargarTratamientos = async () => {
  try {
    const response = await api.get("/tratamientos/");
    tratamientos.value = response.data;
  } catch (error) {
    console.error("Error cargando tratamientos:", error);
    alert("Error al cargar los tratamientos");
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

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const editarTratamiento = (tratamiento) => {
  tratamientoEditando.value = tratamiento;
  formTratamiento.value = {
    animal: tratamiento.animal,
    fecha: tratamiento.fecha,
    medicamento: tratamiento.medicamento,
    dosis: tratamiento.dosis,
    duracion: tratamiento.duracion,
    administrado_por: tratamiento.administrado_por || "",
    observaciones: tratamiento.observaciones || "",
  };
  mostrarModalTratamiento.value = true;
};

const duplicarTratamiento = (tratamiento) => {
  formTratamiento.value = {
    animal: tratamiento.animal,
    fecha: new Date().toISOString().split("T")[0],
    medicamento: tratamiento.medicamento,
    dosis: tratamiento.dosis,
    duracion: tratamiento.duracion,
    administrado_por: tratamiento.administrado_por || "",
    observaciones: tratamiento.observaciones || "",
  };
  tratamientoEditando.value = null;
  mostrarModalTratamiento.value = true;
};

const eliminarTratamiento = async (tratamiento) => {
  if (!confirm("¿Estás seguro de eliminar este tratamiento?")) return;

  try {
    await api.delete(`/tratamientos/${tratamiento.id}/`);
    tratamientos.value = tratamientos.value.filter(
      (t) => t.id !== tratamiento.id,
    );
    alert("Tratamiento eliminado correctamente");
  } catch (error) {
    console.error("Error eliminando tratamiento:", error);
    alert("Error al eliminar el tratamiento");
  }
};

const guardarTratamiento = async () => {
  guardando.value = true;

  try {
    const datos = {
      animal: parseInt(formTratamiento.value.animal),
      fecha: formTratamiento.value.fecha,
      medicamento: formTratamiento.value.medicamento,
      dosis: formTratamiento.value.dosis,
      duracion: formTratamiento.value.duracion,
      observaciones: formTratamiento.value.observaciones,
    };

    // Solo agregar administrado_por si se seleccionó
    if (formTratamiento.value.administrado_por) {
      datos.administrado_por = parseInt(formTratamiento.value.administrado_por);
    }

    if (tratamientoEditando.value) {
      // Actualizar tratamiento existente
      const response = await api.put(
        `/tratamientos/${tratamientoEditando.value.id}/`,
        datos,
      );
      const index = tratamientos.value.findIndex(
        (t) => t.id === tratamientoEditando.value.id,
      );
      tratamientos.value[index] = response.data;
    } else {
      // Crear nuevo tratamiento
      const response = await api.post("/tratamientos/", datos);
      tratamientos.value.unshift(response.data);
    }

    cerrarModal();
    alert("Tratamiento guardado correctamente");
  } catch (error) {
    console.error("Error guardando tratamiento:", error);
    console.error("Respuesta del servidor:", error.response?.data);

    const errorMsg = error.response?.data
      ? JSON.stringify(error.response.data, null, 2)
      : "Error desconocido";
    alert(`Error al guardar: ${errorMsg}`);
  } finally {
    guardando.value = false;
  }
};

const cerrarModal = () => {
  mostrarModalTratamiento.value = false;
  tratamientoEditando.value = null;
  formTratamiento.value = {
    animal: "",
    fecha: new Date().toISOString().split("T")[0],
    medicamento: "",
    dosis: "",
    duracion: "",
    administrado_por: "",
    observaciones: "",
  };
};

// Cargar datos al montar
onMounted(() => {
  cargarTratamientos();
  cargarAnimales();
  cargarUsuarios();
});
</script>

<style scoped>
.tratamientos-page {
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
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #229954;
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
  border-color: #27ae60;
}

/* Grid de tratamientos */
.tratamientos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.tratamiento-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #27ae60;
  transition: all 0.2s;
}

.tratamiento-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.tratamiento-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.medicamento-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.animal-info {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.tratamiento-fecha {
  text-align: right;
}

.fecha-valor {
  background: #d5f4e6;
  color: #27ae60;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.tratamiento-detalles {
  margin-bottom: 1rem;
}

.detalle-row {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.detalle-label {
  font-weight: 500;
  color: #7f8c8d;
}

.detalle-valor {
  color: #2c3e50;
  font-weight: 500;
}

.tratamiento-observaciones {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.tratamiento-observaciones p {
  margin: 0;
  font-size: 0.9rem;
  color: #34495e;
  line-height: 1.4;
}

.tratamiento-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-duplicate,
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

.btn-duplicate {
  background: #e8f6fd;
  color: #3498db;
}

.btn-duplicate:hover {
  background: #3498db;
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

.no-tratamientos {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.btn-add {
  background: #27ae60;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 1rem;
}

.btn-add:hover {
  background: #229954;
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

.tratamiento-form {
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
  border-color: #27ae60;
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
  .tratamientos-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .filtros-row {
    grid-template-columns: 1fr;
  }

  .tratamientos-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .tratamiento-actions {
    flex-direction: column;
  }

  .tratamiento-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
