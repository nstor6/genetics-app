<template>
  <div class="layout-container">
    <router-view />
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
// Layout simple que envuelve las vistas con barra inferior
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
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
}
</style>
