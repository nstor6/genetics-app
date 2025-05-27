<template>
  <div class="layout-container">
    <router-view />
    <nav class="bottom-nav">
      <router-link to="/resumen" :class="{ active: $route.path === '/resumen' }"
        >Resumen</router-link
      >
      <router-link to="/grupos" :class="{ active: $route.path === '/grupos' }"
        >Grupos</router-link
      >
      <router-link
        to="/calendario"
        :class="{ active: $route.path === '/calendario' }"
        >Calendario</router-link
      >
      <router-link to="/ajustes" :class="{ active: $route.path === '/ajustes' }"
        >Ajustes</router-link
      >
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
  padding: 0.75rem 1rem;
  border-top: 1px solid #ccc;
  background-color: #f9f9f9;
  position: fixed;
  bottom: 0;
  width: 100%;
}

.bottom-nav a {
  text-decoration: none;
  color: #666;
  font-weight: 500;
}

.bottom-nav a.active {
  color: #007bff;
  font-weight: bold;
}
</style>
