<template>
  <div class="resumen-page">
    <div class="page-header">
      <h1>📊 Resumen General</h1>
      <p class="fecha">{{ fechaActual }}</p>
    </div>

    <!-- Cards de estadísticas -->
    <div class="stats-grid">
      <div class="stat-card animales">
        <div class="stat-icon">🐄</div>
        <div class="stat-info">
          <h3>{{ totalAnimales }}</h3>
          <p>Total Animales</p>
        </div>
      </div>

      <div class="stat-card incidencias">
        <div class="stat-icon">⚠️</div>
        <div class="stat-info">
          <h3>{{ incidenciasPendientes }}</h3>
          <p>Incidencias Pendientes</p>
        </div>
      </div>

      <div class="stat-card tratamientos">
        <div class="stat-icon">💊</div>
        <div class="stat-info">
          <h3>{{ tratamientosActivos }}</h3>
          <p>Tratamientos Activos</p>
        </div>
      </div>

      <div class="stat-card eventos">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <h3>{{ eventosHoy }}</h3>
          <p>Eventos Hoy</p>
        </div>
      </div>
    </div>

    <!-- Alertas importantes -->
    <div class="alerts-section" v-if="alertas.length > 0">
      <h2>🔔 Alertas Importantes</h2>
      <div class="alerts-list">
        <div
          v-for="alerta in alertas"
          :key="alerta.id"
          :class="['alert-item', alerta.tipo]"
        >
          <div class="alert-icon">{{ alerta.icono }}</div>
          <div class="alert-content">
            <h4>{{ alerta.titulo }}</h4>
            <p>{{ alerta.mensaje }}</p>
            <small>{{ alerta.fecha }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Próximos eventos -->
    <div class="eventos-section">
      <h2>📅 Próximos Eventos</h2>
      <div class="eventos-lista" v-if="proximosEventos.length > 0">
        <div
          v-for="evento in proximosEventos"
          :key="evento.id"
          class="evento-card"
        >
          <div class="evento-fecha">
            <span class="dia">{{ formatearDia(evento.fecha_inicio) }}</span>
            <span class="mes">{{ formatearMes(evento.fecha_inicio) }}</span>
          </div>
          <div class="evento-info">
            <h4>{{ evento.titulo }}</h4>
            <p>{{ evento.descripcion }}</p>
            <span class="evento-tipo">{{ evento.tipo }}</span>
          </div>
        </div>
      </div>
      <p v-else class="no-eventos">No hay eventos próximos</p>
    </div>

    <!-- Acciones rápidas -->
    <div class="acciones-rapidas">
      <h2>⚡ Acciones Rápidas</h2>
      <div class="acciones-grid">
        <router-link to="/animales" class="accion-btn">
          <div class="accion-icon">🐄</div>
          <span>Gestionar Animales</span>
        </router-link>

        <router-link to="/incidencias" class="accion-btn">
          <div class="accion-icon">⚠️</div>
          <span>Nueva Incidencia</span>
        </router-link>

        <router-link to="/calendario" class="accion-btn">
          <div class="accion-icon">📅</div>
          <span>Ver Calendario</span>
        </router-link>

        <router-link to="/tratamientos" class="accion-btn">
          <div class="accion-icon">💊</div>
          <span>Tratamientos</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../services/api";

// Estados reactivos
const totalAnimales = ref(0);
const incidenciasPendientes = ref(0);
const tratamientosActivos = ref(0);
const eventosHoy = ref(0);
const alertas = ref([]);
const proximosEventos = ref([]);

// Fecha actual
const fechaActual = computed(() => {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Cargar datos del dashboard
const cargarDatos = async () => {
  try {
    // Cargar estadísticas básicas
    const [animalesRes, incidenciasRes, tratamientosRes, eventosRes] =
      await Promise.all([
        api.get("/animales/"),
        api.get("/incidencias/"),
        api.get("/tratamientos/"),
        api.get("/eventos/"),
      ]);

    totalAnimales.value = animalesRes.data.length;
    incidenciasPendientes.value = incidenciasRes.data.filter(
      (i) => i.estado === "pendiente",
    ).length;
    tratamientosActivos.value = tratamientosRes.data.length;

    // Eventos de hoy
    const hoy = new Date().toISOString().split("T")[0];
    eventosHoy.value = eventosRes.data.filter((e) =>
      e.fecha_inicio.startsWith(hoy),
    ).length;

    // Próximos eventos (próximos 7 días)
    const proximos7Dias = new Date();
    proximos7Dias.setDate(proximos7Dias.getDate() + 7);

    proximosEventos.value = eventosRes.data
      .filter(
        (e) =>
          new Date(e.fecha_inicio) <= proximos7Dias &&
          new Date(e.fecha_inicio) >= new Date(),
      )
      .slice(0, 5);

    // Generar alertas basadas en los datos
    generarAlertas(incidenciasRes.data, eventosRes.data);
  } catch (error) {
    console.error("Error cargando datos del dashboard:", error);
  }
};

// Generar alertas inteligentes
const generarAlertas = (incidencias, eventos) => {
  const nuevasAlertas = [];

  // Alertas por incidencias críticas
  const incidenciasCriticas = incidencias.filter(
    (i) =>
      i.estado === "pendiente" && i.tipo.toLowerCase().includes("enfermedad"),
  );

  if (incidenciasCriticas.length > 0) {
    nuevasAlertas.push({
      id: 1,
      tipo: "critica",
      icono: "🚨",
      titulo: "Incidencias Críticas",
      mensaje: `${incidenciasCriticas.length} incidencias de salud requieren atención inmediata`,
      fecha: "Ahora",
    });
  }

  // Alertas por eventos próximos
  const eventosHoy = eventos.filter((e) =>
    e.fecha_inicio.startsWith(new Date().toISOString().split("T")[0]),
  );

  if (eventosHoy.length > 0) {
    nuevasAlertas.push({
      id: 2,
      tipo: "info",
      icono: "📅",
      titulo: "Eventos Programados Hoy",
      mensaje: `Tienes ${eventosHoy.length} eventos programados para hoy`,
      fecha: "Hoy",
    });
  }

  alertas.value = nuevasAlertas;
};

// Formatear fechas
const formatearDia = (fecha) => {
  return new Date(fecha).getDate();
};

const formatearMes = (fecha) => {
  return new Date(fecha).toLocaleDateString("es-ES", { month: "short" });
};

// Cargar datos al montar
onMounted(() => {
  cargarDatos();
});
</script>

<style scoped>
.resumen-page {
  padding: 1.5rem;
  padding-bottom: 5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
}

.fecha {
  color: #7f8c8d;
  margin: 0.5rem 0;
  text-transform: capitalize;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info h3 {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
}

.stat-info p {
  margin: 0.25rem 0 0 0;
  color: #7f8c8d;
}

.animales {
  border-left: 4px solid #3498db;
}
.incidencias {
  border-left: 4px solid #e74c3c;
}
.tratamientos {
  border-left: 4px solid #2ecc71;
}
.eventos {
  border-left: 4px solid #f39c12;
}

/* Alertas */
.alerts-section {
  margin-bottom: 2rem;
}

.alerts-section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-item {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.alert-item.critica {
  border-left: 4px solid #e74c3c;
}

.alert-item.info {
  border-left: 4px solid #3498db;
}

.alert-icon {
  font-size: 1.5rem;
}

.alert-content h4 {
  margin: 0;
  color: #2c3e50;
}

.alert-content p {
  margin: 0.25rem 0;
  color: #7f8c8d;
}

.alert-content small {
  color: #95a5a6;
}

/* Eventos */
.eventos-section {
  margin-bottom: 2rem;
}

.eventos-section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.eventos-lista {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.evento-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.evento-fecha {
  background: #3498db;
  color: white;
  border-radius: 8px;
  padding: 0.5rem;
  text-align: center;
  min-width: 60px;
}

.evento-fecha .dia {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
}

.evento-fecha .mes {
  display: block;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.evento-info h4 {
  margin: 0;
  color: #2c3e50;
}

.evento-info p {
  margin: 0.25rem 0;
  color: #7f8c8d;
}

.evento-tipo {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.no-eventos {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 2rem;
}

/* Acciones rápidas */
.acciones-rapidas h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.acciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.accion-btn {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  text-decoration: none;
  color: #2c3e50;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.accion-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.accion-icon {
  font-size: 2rem;
}

.accion-btn span {
  font-weight: 500;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .resumen-page {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .acciones-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .evento-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
