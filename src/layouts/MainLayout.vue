<template>
  <div class="layout-container">
    <!-- Header con notificaciones -->
    <header class="app-header">
      <h1 class="app-title">🐄 Genetics</h1>
      <NotificationCenter />
    </header>

    <!-- Contenido principal -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Navegación inferior -->
    <nav class="bottom-nav">
      <router-link
        to="/resumen"
        :class="{ active: $route.path === '/resumen' }"
      >
        📊 Resumen
      </router-link>
      <router-link to="/grupos" :class="{ active: $route.path === '/grupos' }">
        🐄 Animales
      </router-link>
      <router-link
        to="/incidencias"
        :class="{ active: $route.path === '/incidencias' }"
      >
        🚨 Incidencias
      </router-link>
      <router-link
        to="/tratamientos"
        :class="{ active: $route.path === '/tratamientos' }"
      >
        💊 Tratamientos
      </router-link>
      <router-link
        to="/calendario"
        :class="{ active: $route.path === '/calendario' }"
      >
        📅 Calendario
      </router-link>
      <router-link
        to="/ajustes"
        :class="{ active: $route.path === '/ajustes' }"
      >
        ⚙️ Ajustes
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import NotificationCenter from '../components/NotificationCenter.vue'
import { useAnimalUpdates } from '../composables/useWebSocket'

// Usar WebSocket para updates de animales
const { updates } = useAnimalUpdates()

// Escuchar eventos de actualización de animales
window.addEventListener('animalUpdate', (event) => {
  console.log('Animal actualizado:', event.detail)
  // Aquí puedes agregar lógica adicional si necesitas
})
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: #f3f4f6;
}

.bottom-nav {
  display: flex;
  justify-content: space-around;
  padding: 0.75rem 0.5rem;
  border-top: 1px solid #ccc;
  background-color: #f9f9f9;
  position: fixed;
  bottom: 0;
  width: 100%;
  box-sizing: border-box;
}

.bottom-nav a {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  font-size: 0.8rem;
  text-align: center;
  padding: 0.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.bottom-nav a.active {
  color: #007bff;
  font-weight: bold;
}

@media (max-width: 768px) {
  .bottom-nav {
    font-size: 0.7rem;
  }

  .bottom-nav a {
    padding: 0.5rem 0.25rem;
  }

  .app-header {
    padding: 0.75rem 1rem;
  }

  .app-title {
    font-size: 1.2rem;
  }
}
</style>