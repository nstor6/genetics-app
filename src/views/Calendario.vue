<template>
  <div class="calendario-page">
    <div class="page-header">
      <h1>📅 Calendario de Eventos</h1>
      <button @click="mostrarModalEvento = true" class="btn-primary">
        + Nuevo Evento
      </button>
    </div>

    <div class="calendario-nav">
      <button @click="mesAnterior" class="nav-btn">‹</button>
      <h2 class="mes-actual">{{ nombreMesActual }} {{ añoActual }}</h2>
      <button @click="mesSiguiente" class="nav-btn">›</button>
    </div>

    <div class="calendario-container">
      <div class="calendario-grid">
        <div class="dia-semana" v-for="dia in diasSemana" :key="dia">
          {{ dia }}
        </div>

        <div
          v-for="dia in diasDelMes"
          :key="dia.fecha"
          :class="[
            'dia-calendario',
            {
              'dia-otro-mes': !dia.esDelMes,
              'dia-hoy': dia.esHoy,
              'dia-con-eventos': dia.eventos.length > 0,
            },
          ]"
          @click="seleccionarDia(dia)"
        >
          <span class="numero-dia">{{ dia.numero }}</span>

          <div class="eventos-dia" v-if="dia.eventos.length > 0">
            <div
              v-for="evento in dia.eventos.slice(0, 2)"
              :key="evento.id"
              :class="['evento-item', `evento-${evento.tipo}`]"
              @click.stop="verEvento(evento)"
            >
              <span class="evento-titulo">{{ evento.titulo }}</span>
            </div>
            <div v-if="dia.eventos.length > 2" class="mas-eventos">
              +{{ dia.eventos.length - 2 }} más
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="diaSeleccionado && eventosDelDia.length > 0"
      class="eventos-detalle"
    >
      <h3>Eventos del {{ formatearFecha(diaSeleccionado.fecha) }}</h3>
      <div class="eventos-lista">
        <div
          v-for="evento in eventosDelDia"
          :key="evento.id"
          :class="['evento-card', `evento-${evento.tipo}`]"
        >
          <div class="evento-info">
            <h4>{{ evento.titulo }}</h4>
            <p>{{ evento.descripcion }}</p>
            <div class="evento-meta">
              <span class="evento-hora">{{
                formatearHora(evento.fecha_inicio)
              }}</span>
              <span class="evento-tipo-badge">{{ evento.tipo }}</span>
            </div>
          </div>
          <div class="evento-acciones">
            <button @click="editarEvento(evento)" class="btn-edit">✏️</button>
            <button @click="eliminarEvento(evento)" class="btn-delete">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="mostrarModalEvento"
      class="modal-overlay"
      @click="cerrarModalEvento"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ eventoEditando ? "Editar Evento" : "Nuevo Evento" }}</h2>
          <button @click="cerrarModalEvento" class="btn-close">×</button>
        </div>

        <form @submit.prevent="guardarEvento" class="evento-form">
          <div class="form-group">
            <label>Título *</label>
            <input
              v-model="formEvento.titulo"
              type="text"
              required
              placeholder="Ej: Visita veterinaria"
            />
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea
              v-model="formEvento.descripcion"
              rows="3"
              placeholder="Detalles del evento..."
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Tipo de Evento *</label>
              <select v-model="formEvento.tipo" required>
                <option value="">Seleccionar tipo</option>
                <option value="visita">Visita veterinaria</option>
                <option value="tratamiento">Tratamiento</option>
                <option value="alerta_parto">Alerta de parto</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div class="form-group">
              <label>Animal (opcional)</label>
              <select v-model="formEvento.animal">
                <option value="">Sin animal específico</option>
                <option
                  v-for="animal in animales"
                  :key="animal.id"
                  :value="animal.id"
                >
                  {{ animal.chapeta }} - {{ animal.nombre || "Sin nombre" }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Fecha de Inicio *</label>
              <input
                v-model="formEvento.fecha_inicio"
                type="datetime-local"
                required
              />
            </div>
            <div class="form-group">
              <label>Fecha de Fin</label>
              <input v-model="formEvento.fecha_fin" type="datetime-local" />
            </div>
          </div>

          <div class="form-group">
            <label>
              <input v-model="formEvento.recurrente" type="checkbox" />
              Evento recurrente
            </label>
          </div>

          <div class="form-actions">
            <button type="button" @click="cerrarModalEvento" class="btn-cancel">
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
import { ref, onMounted, computed, watch } from "vue";
import api from "../services/api"; // Ensure this path is correct

// Reactive states
const eventos = ref([]);
const animales = ref([]);
const fechaActual = ref(new Date());
const diaSeleccionado = ref(null);
const mostrarModalEvento = ref(false);
const eventoEditando = ref(null);
const guardando = ref(false);

// Event form
const formEvento = ref({
  titulo: "",
  descripcion: "",
  tipo: "",
  animal: "",
  fecha_inicio: "",
  fecha_fin: "",
  recurrente: false,
});

// Weekday names
const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Month names
const nombresMeses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Computed properties
const añoActual = computed(() => fechaActual.value.getFullYear());
const mesActual = computed(() => fechaActual.value.getMonth());
const nombreMesActual = computed(() => nombresMeses[mesActual.value]);

const diasDelMes = computed(() => {
  const año = añoActual.value;
  const mes = mesActual.value;
  const primerDia = new Date(año, mes, 1);
  const ultimoDia = new Date(año, mes + 1, 0);
  const diasEnMes = ultimoDia.getDate();
  const primerDiaSemana = primerDia.getDay(); // 0 for Sunday, 1 for Monday, etc.

  const dias = [];
  const hoy = new Date();

  // Days from previous month to fill the start of the grid
  const mesAnterior = new Date(año, mes - 1, 0); // Last day of previous month
  for (let i = primerDiaSemana - 1; i >= 0; i--) {
    const dia = mesAnterior.getDate() - i;
    const fecha = new Date(año, mes - 1, dia);
    dias.push({
      numero: dia,
      fecha: fecha.toISOString().split("T")[0],
      esDelMes: false,
      esHoy: false,
      eventos: obtenerEventosDelDia(fecha),
    });
  }

  // Days of the current month
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fecha = new Date(año, mes, dia);
    const esHoy = fecha.toDateString() === hoy.toDateString();

    dias.push({
      numero: dia,
      fecha: fecha.toISOString().split("T")[0],
      esDelMes: true,
      esHoy,
      eventos: obtenerEventosDelDia(fecha),
    });
  }

  // Days from next month to complete the grid (always 6 weeks total for consistency)
  const diasRestantes = 42 - dias.length; // 6 weeks * 7 days
  for (let dia = 1; dia <= diasRestantes; dia++) {
    const fecha = new Date(año, mes + 1, dia);
    dias.push({
      numero: dia,
      fecha: fecha.toISOString().split("T")[0],
      esDelMes: false,
      esHoy: false,
      eventos: obtenerEventosDelDia(fecha),
    });
  }

  return dias;
});

const eventosDelDia = computed(() => {
  if (!diaSeleccionado.value) return [];
  // Ensure we pass a Date object to obtenerEventosDelDia
  return obtenerEventosDelDia(new Date(diaSeleccionado.value.fecha));
});

// Methods
const obtenerEventosDelDia = (fecha) => {
  // The warning here will be less frequent if cargarEventos is fixed
  if (!Array.isArray(eventos.value)) {
    console.warn("⚠️ eventos.value no es un array (en obtenerEventosDelDia):", eventos.value);
    return [];
  }

  const fechaStr = fecha.toISOString().split("T")[0];
  return eventos.value.filter((evento) => {
    // Ensure evento.fecha_inicio is a string before creating a Date object
    if (typeof evento.fecha_inicio !== 'string') {
      console.warn('Evento con fecha_inicio no válida:', evento);
      return false;
    }
    const eventoFecha = new Date(evento.fecha_inicio)
      .toISOString()
      .split("T")[0];
    return eventoFecha === fechaStr;
  });
};

const cargarEventos = async () => {
  try {
    const response = await api.get("/eventos/");
    // *** IMPORTANT: Adjust this line based on your API response structure ***
    // Option 1: If your API directly returns an array:
    if (Array.isArray(response.data)) {
      eventos.value = response.data;
    }
    // Option 2: If your API returns an object like { "events": [...] }
    else if (response.data && Array.isArray(response.data.events)) {
      eventos.value = response.data.events;
    }
    // Option 3: If your API returns an object like { "results": [...] } (common in paginated APIs)
    else if (response.data && Array.isArray(response.data.results)) {
      eventos.value = response.data.results;
    }
    // Option 4: If your API returns an object with a single event or other structure
    // and you need to ensure it's an array for the calendar:
    // If it's an object but represents a list, you might convert its values or properties.
    // For now, if it's not an array, we'll log and set to empty to prevent errors.
    else {
      console.warn("La respuesta de la API para /eventos/ no es un array o no contiene un array en una propiedad esperada:", response.data);
      eventos.value = []; // Ensure it's an array to prevent errors in computed properties
    }
  } catch (error) {
    console.error("Error cargando eventos:", error);
    eventos.value = []; // Ensure it's an array on error
  }
};

const cargarAnimales = async () => {
  try {
    const response = await api.get("/animales/");
    // Assuming /animales/ also returns an array directly or within a 'data'/'results' property
    if (Array.isArray(response.data)) {
      animales.value = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      animales.value = response.data.results;
    } else {
      console.warn("La respuesta de la API para /animales/ no es un array:", response.data);
      animales.value = [];
    }
  } catch (error) {
    console.error("Error cargando animales:", error);
    animales.value = []; // Set to empty array on error
  }
};

const mesAnterior = () => {
  const nuevaFecha = new Date(fechaActual.value);
  nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
  fechaActual.value = nuevaFecha;
};

const mesSiguiente = () => {
  const nuevaFecha = new Date(fechaActual.value);
  nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
  fechaActual.value = nuevaFecha;
};

const seleccionarDia = (dia) => {
  diaSeleccionado.value = dia;
};

const verEvento = (evento) => {
  console.log("Ver evento:", evento);
  // Here you could open an event details modal
};

const editarEvento = (evento) => {
  eventoEditando.value = evento;
  formEvento.value = {
    titulo: evento.titulo,
    descripcion: evento.descripcion || "",
    tipo: evento.tipo,
    // Ensure animal is the ID, not the full object if it comes that way
    animal: evento.animal_id || evento.animal || "", // Prioritize animal_id if your API sends it
    fecha_inicio: evento.fecha_inicio,
    fecha_fin: evento.fecha_fin || "",
    recurrente: evento.recurrente || false,
  };
  mostrarModalEvento.value = true;
};

const eliminarEvento = async (evento) => {
  if (!confirm("¿Estás seguro de que quieres eliminar este evento?")) return;

  try {
    await api.delete(`/eventos/${evento.id}/`);
    // Filter out the deleted event from the reactive list
    eventos.value = eventos.value.filter((e) => e.id !== evento.id);
    // If the selected day's events are affected, re-evaluate them
    if (diaSeleccionado.value) {
      diaSeleccionado.value.eventos = obtenerEventosDelDia(new Date(diaSeleccionado.value.fecha));
    }
    alert("Evento eliminado correctamente");
  } catch (error) {
    console.error("Error eliminando evento:", error);
    alert("Error al eliminar el evento");
  }
};

const guardarEvento = async () => {
  guardando.value = true;

  try {
    let response;
    if (eventoEditando.value) {
      // Update existing event
      response = await api.put(
        `/eventos/${eventoEditando.value.id}/`,
        formEvento.value,
      );
      const index = eventos.value.findIndex(
        (e) => e.id === eventoEditando.value.id,
      );
      if (index !== -1) {
        // Update the item in the reactive array
        eventos.value[index] = response.data;
      }
    } else {
      // Create new event
      response = await api.post("/eventos/", formEvento.value);
      eventos.value.push(response.data);
    }

    // Refresh calendar data after save/update if needed
    // A simple way is to reload all events, but for performance,
    // you might just insert/update the specific event.
    // For a calendar, recalculating `diasDelMes` or updating
    // specific day's events is better.
    // Since `diasDelMes` is a computed property depending on `eventos.value`,
    // it will reactively update when `eventos.value` changes.

    cerrarModalEvento();
    alert("Evento guardado correctamente");
  } catch (error) {
    console.error("Error guardando evento:", error);
    alert("Error al guardar el evento");
  } finally {
    guardando.value = false;
  }
};

const cerrarModalEvento = () => {
  mostrarModalEvento.value = false;
  eventoEditando.value = null;
  // Reset form
  formEvento.value = {
    titulo: "",
    descripcion: "",
    tipo: "",
    animal: "",
    fecha_inicio: "",
    fecha_fin: "",
    recurrente: false,
  };
};

const formatearFecha = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatearHora = (fechaHora) => {
  if (!fechaHora) return '';
  return new Date(fechaHora).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Load data on component mount
onMounted(() => {
  cargarEventos();
  cargarAnimales();
});
</script>

<style scoped>
/* Your existing CSS styles remain unchanged */
.calendario-page {
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

/* Navegación del calendario */
.calendario-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.nav-btn {
  background: #ecf0f1;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  color: #2c3e50;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #bdc3c7;
}

.mes-actual {
  margin: 0;
  color: #2c3e50;
  min-width: 200px;
  text-align: center;
}

/* Calendario */
.calendario-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.calendario-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.dia-semana {
  background: #34495e;
  color: white;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.dia-calendario {
  min-height: 120px;
  border: 1px solid #ecf0f1;
  padding: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.dia-calendario:hover {
  background: #f8f9fa;
}

.dia-otro-mes {
  background: #f8f9fa;
  color: #bdc3c7;
}

.dia-hoy {
  background: #e8f6fd;
  border-color: #3498db;
}

.dia-con-eventos {
  background: #fef9e7;
}

.numero-dia {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
}

.dia-otro-mes .numero-dia {
  color: #bdc3c7;
}

.eventos-dia {
  margin-top: 0.5rem;
}

.evento-item {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.evento-item:hover {
  opacity: 0.8;
}

.evento-titulo {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.evento-visita {
  background: #3498db;
}
.evento-tratamiento {
  background: #27ae60;
}
.evento-alerta_parto {
  background: #e74c3c;
}
.evento-otro {
  background: #95a5a6;
}

.mas-eventos {
  font-size: 0.7rem;
  color: #7f8c8d;
  text-align: center;
  margin-top: 0.25rem;
}

/* Eventos detalle */
.eventos-detalle {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.eventos-detalle h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  text-transform: capitalize;
}

.eventos-lista {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.evento-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.evento-card.evento-visita {
  border-left-color: #3498db;
}
.evento-card.evento-tratamiento {
  border-left-color: #27ae60;
}
.evento-card.evento-alerta_parto {
  border-left-color: #e74c3c;
}
.evento-card.evento-otro {
  border-left-color: #95a5a6;
}

.evento-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.evento-info p {
  margin: 0 0 0.5rem 0;
  color: #7f8c8d;
}

.evento-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.evento-hora {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.evento-tipo-badge {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.evento-acciones {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.btn-edit {
  color: #f39c12;
}

.btn-edit:hover {
  background: #fef9e7;
}

.btn-delete {
  color: #e74c3c;
}

.btn-delete:hover {
  background: #fdedec;
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

.evento-form {
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

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
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
  .calendario-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .calendario-grid {
    font-size: 0.9rem;
  }

  .dia-calendario {
    min-height: 80px;
    padding: 0.25rem;
  }

  .numero-dia {
    font-size: 1rem;
  }

  .evento-item {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .evento-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>