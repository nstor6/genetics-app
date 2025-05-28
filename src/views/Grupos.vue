<template>
  <div class="grupos-page">
    <div class="page-header">
      <h1>🐄 Gestión de Animales</h1>
      <button @click="mostrarModalAnimal = true" class="btn-primary">
        + Nuevo Animal
      </button>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="filtros-section">
      <div class="filtros-row">
        <input
          v-model="busqueda"
          type="text"
          placeholder="🔍 Buscar por chapeta o nombre..."
          class="search-input"
        />

        <select v-model="filtroEstado" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="retirado">Retirado</option>
          <option value="engorde">Engorde</option>
        </select>

        <select v-model="filtroSexo" class="filter-select">
          <option value="">Todos los sexos</option>
          <option value="macho">Macho</option>
          <option value="hembra">Hembra</option>
        </select>
      </div>
    </div>

    <!-- Lista de animales -->
    <div class="animales-grid" v-if="animalesFiltrados.length > 0">
      <div
        v-for="animal in animalesFiltrados"
        :key="animal.id"
        class="animal-card"
        @click="seleccionarAnimal(animal)"
      >
        <div class="animal-header">
          <div class="animal-foto">
            <img
              v-if="animal.foto_perfil_url"
              :src="animal.foto_perfil_url"
              :alt="animal.chapeta"
            />
            <div v-else class="foto-placeholder">
              {{ animal.sexo === "macho" ? "🐂" : "🐄" }}
            </div>
          </div>
          <div class="animal-info">
            <h3>{{ animal.chapeta }}</h3>
            <p v-if="animal.nombre">{{ animal.nombre }}</p>
            <span :class="['estado-badge', animal.estado_productivo]">
              {{ animal.estado_productivo }}
            </span>
          </div>
        </div>

        <div class="animal-details">
          <div class="detail-row">
            <span class="label">Sexo:</span>
            <span>{{ animal.sexo }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Raza:</span>
            <span>{{ animal.raza }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Edad:</span>
            <span>{{ calcularEdad(animal.fecha_nacimiento) }}</span>
          </div>
          <div class="detail-row" v-if="animal.peso_actual">
            <span class="label">Peso:</span>
            <span>{{ animal.peso_actual }} kg</span>
          </div>
        </div>

        <div class="animal-actions">
          <button @click.stop="editarAnimal(animal)" class="btn-edit">
            ✏️ Editar
          </button>
          <button @click.stop="verDetalles(animal)" class="btn-info">
            👁️ Ver
          </button>
        </div>
      </div>
    </div>

    <div v-else class="no-animales">
      <p>No se encontraron animales con los filtros aplicados</p>
    </div>

    <!-- Modal para crear/editar animal -->
    <div v-if="mostrarModalAnimal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ animalEditando ? "Editar Animal" : "Nuevo Animal" }}</h2>
          <button @click="cerrarModal" class="btn-close">×</button>
        </div>

        <form @submit.prevent="guardarAnimal" class="animal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Chapeta *</label>
              <input
                v-model="formAnimal.chapeta"
                type="text"
                required
                placeholder="Ej: A001"
              />
            </div>
            <div class="form-group">
              <label>Nombre</label>
              <input
                v-model="formAnimal.nombre"
                type="text"
                placeholder="Nombre opcional"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Sexo *</label>
              <select v-model="formAnimal.sexo" required>
                <option value="">Seleccionar</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fecha de Nacimiento *</label>
              <input
                v-model="formAnimal.fecha_nacimiento"
                type="date"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Raza *</label>
              <input
                v-model="formAnimal.raza"
                type="text"
                required
                placeholder="Ej: Holstein"
              />
            </div>
            <div class="form-group">
              <label>Peso Actual (kg)</label>
              <input
                v-model="formAnimal.peso_actual"
                type="number"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Estado Reproductivo</label>
              <select v-model="formAnimal.estado_reproductivo">
                <option value="">Seleccionar</option>
                <option value="gestante">Gestante</option>
                <option value="lactante">Lactante</option>
                <option value="vacío">Vacío</option>
                <option value="castrado">Castrado</option>
              </select>
            </div>
            <div class="form-group">
              <label>Estado Productivo</label>
              <select v-model="formAnimal.estado_productivo">
                <option value="">Seleccionar</option>
                <option value="activo">Activo</option>
                <option value="retirado">Retirado</option>
                <option value="engorde">Engorde</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Ubicación Actual</label>
            <input
              v-model="formAnimal.ubicacion_actual"
              type="text"
              placeholder="Ej: Corral A-5"
            />
          </div>

          <div class="form-group">
            <label>Notas</label>
            <textarea
              v-model="formAnimal.notas"
              rows="3"
              placeholder="Observaciones adicionales..."
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

    <!-- Modal de detalles -->
    <div
      v-if="animalDetalle"
      class="modal-overlay"
      @click="animalDetalle = null"
    >
      <div class="modal-content modal-detalle" @click.stop>
        <div class="modal-header">
          <h2>
            {{ animalDetalle.chapeta }} -
            {{ animalDetalle.nombre || "Sin nombre" }}
          </h2>
          <button @click="animalDetalle = null" class="btn-close">×</button>
        </div>

        <div class="detalle-content">
          <div class="detalle-foto">
            <img
              v-if="animalDetalle.foto_perfil_url"
              :src="animalDetalle.foto_perfil_url"
              :alt="animalDetalle.chapeta"
            />
            <div v-else class="foto-placeholder-large">
              {{ animalDetalle.sexo === "macho" ? "🐂" : "🐄" }}
            </div>
            <button @click="subirFoto" class="btn-upload">
              📷 Cambiar Foto
            </button>
          </div>

          <div class="detalle-info">
            <div class="info-section">
              <h3>Información Básica</h3>
              <div class="info-grid">
                <div><strong>Chapeta:</strong> {{ animalDetalle.chapeta }}</div>
                <div>
                  <strong>Nombre:</strong>
                  {{ animalDetalle.nombre || "Sin nombre" }}
                </div>
                <div><strong>Sexo:</strong> {{ animalDetalle.sexo }}</div>
                <div><strong>Raza:</strong> {{ animalDetalle.raza }}</div>
                <div>
                  <strong>Edad:</strong>
                  {{ calcularEdad(animalDetalle.fecha_nacimiento) }}
                </div>
                <div>
                  <strong>Peso:</strong>
                  {{ animalDetalle.peso_actual || "No registrado" }} kg
                </div>
              </div>
            </div>

            <div class="info-section">
              <h3>Estados</h3>
              <div class="info-grid">
                <div>
                  <strong>Reproductivo:</strong>
                  {{ animalDetalle.estado_reproductivo || "No definido" }}
                </div>
                <div>
                  <strong>Productivo:</strong>
                  {{ animalDetalle.estado_productivo || "No definido" }}
                </div>
                <div>
                  <strong>Ubicación:</strong>
                  {{ animalDetalle.ubicacion_actual || "No definida" }}
                </div>
              </div>
            </div>

            <div class="info-section" v-if="animalDetalle.notas">
              <h3>Notas</h3>
              <p>{{ animalDetalle.notas }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../services/api";

// Estados reactivos
const animales = ref([]);
const busqueda = ref("");
const filtroEstado = ref("");
const filtroSexo = ref("");
const mostrarModalAnimal = ref(false);
const animalEditando = ref(null);
const animalDetalle = ref(null);
const guardando = ref(false);

// Formulario de animal
const formAnimal = ref({
  chapeta: "",
  nombre: "",
  sexo: "",
  fecha_nacimiento: "",
  raza: "",
  estado_reproductivo: "",
  estado_productivo: "",
  peso_actual: null,
  ubicacion_actual: "",
  notas: "",
});

// Computed
const animalesFiltrados = computed(() => {
  let resultado = animales.value;

  // Filtro por búsqueda
  if (busqueda.value) {
    const termino = busqueda.value.toLowerCase();
    resultado = resultado.filter(
      (animal) =>
        animal.chapeta.toLowerCase().includes(termino) ||
        (animal.nombre && animal.nombre.toLowerCase().includes(termino)),
    );
  }

  // Filtro por estado productivo
  if (filtroEstado.value) {
    resultado = resultado.filter(
      (animal) => animal.estado_productivo === filtroEstado.value,
    );
  }

  // Filtro por sexo
  if (filtroSexo.value) {
    resultado = resultado.filter((animal) => animal.sexo === filtroSexo.value);
  }

  return resultado;
});

// Métodos
const cargarAnimales = async () => {
  try {
    const response = await api.get("/animales/");
    animales.value = response.data;
  } catch (error) {
    console.error("Error cargando animales:", error);
    alert("Error al cargar los animales");
  }
};

const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  const años = hoy.getFullYear() - nacimiento.getFullYear();
  const meses = hoy.getMonth() - nacimiento.getMonth();

  if (años === 0) {
    return `${Math.abs(meses)} meses`;
  } else if (meses < 0) {
    return `${años - 1} años, ${12 + meses} meses`;
  } else {
    return `${años} años, ${meses} meses`;
  }
};

const seleccionarAnimal = (animal) => {
  console.log("Animal seleccionado:", animal);
};

const editarAnimal = (animal) => {
  animalEditando.value = animal;
  formAnimal.value = { ...animal };
  mostrarModalAnimal.value = true;
};

const verDetalles = (animal) => {
  animalDetalle.value = animal;
};

const guardarAnimal = async () => {
  guardando.value = true;

  try {
    if (animalEditando.value) {
      // Actualizar animal existente
      const response = await api.put(
        `/animales/${animalEditando.value.id}/`,
        formAnimal.value,
      );
      const index = animales.value.findIndex(
        (a) => a.id === animalEditando.value.id,
      );
      animales.value[index] = response.data;
    } else {
      // Crear nuevo animal
      const response = await api.post("/animales/", formAnimal.value);
      animales.value.push(response.data);
    }

    cerrarModal();
    alert("Animal guardado correctamente");
  } catch (error) {
    console.error("Error guardando animal:", error);
    alert("Error al guardar el animal");
  } finally {
    guardando.value = false;
  }
};

const cerrarModal = () => {
  mostrarModalAnimal.value = false;
  animalEditando.value = null;
  formAnimal.value = {
    chapeta: "",
    nombre: "",
    sexo: "",
    fecha_nacimiento: "",
    raza: "",
    estado_reproductivo: "",
    estado_productivo: "",
    peso_actual: null,
    ubicacion_actual: "",
    notas: "",
  };
};

const subirFoto = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post(
        `/animales/${animalDetalle.value.id}/subir-imagen/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      animalDetalle.value.foto_perfil_url = response.data.url;

      // Actualizar también en la lista
      const index = animales.value.findIndex(
        (a) => a.id === animalDetalle.value.id,
      );
      if (index !== -1) {
        animales.value[index].foto_perfil_url = response.data.url;
      }

      alert("Foto subida correctamente");
    } catch (error) {
      console.error("Error subiendo foto:", error);
      alert("Error al subir la foto");
    }
  };

  input.click();
};

// Cargar datos al montar
onMounted(() => {
  cargarAnimales();
});
</script>

<style scoped>
.grupos-page {
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
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2980b9;
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
  border-color: #3498db;
}

/* Grid de animales */
.animales-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.animal-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.animal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.animal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.animal-foto {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.animal-foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.foto-placeholder {
  font-size: 2rem;
}

.animal-info h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.animal-info p {
  margin: 0.25rem 0;
  color: #7f8c8d;
}

.estado-badge {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.estado-badge.activo {
  background: #d5f4e6;
  color: #27ae60;
}
.estado-badge.retirado {
  background: #fadbd8;
  color: #e74c3c;
}
.estado-badge.engorde {
  background: #fef9e7;
  color: #f39c12;
}

.animal-details {
  margin: 1rem 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.detail-row .label {
  font-weight: 500;
  color: #7f8c8d;
}

.animal-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-edit,
.btn-info {
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

.btn-info {
  background: #e8f6fd;
  color: #3498db;
}

.btn-info:hover {
  background: #3498db;
  color: white;
}

.no-animales {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  font-style: italic;
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
  overflow-y: auto;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-detalle {
  max-width: 800px;
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

.animal-form {
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

/* Modal detalles */
.detalle-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  padding: 1.5rem;
}

.detalle-foto {
  text-align: center;
}

.detalle-foto img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.foto-placeholder-large {
  width: 200px;
  height: 200px;
  background: #f8f9fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  margin: 0 auto 1rem;
}

.btn-upload {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-upload:hover {
  background: #2980b9;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-grid div {
  padding: 0.5rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .grupos-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filtros-row {
    grid-template-columns: 1fr;
  }

  .animales-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .detalle-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
