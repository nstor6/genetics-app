import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "../layouts/MainLayout.vue";
import Login from "../views/Login.vue";

const routes = [
  {
    path: "/",
    redirect: "/resumen",
  },
  {
    path: "/",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "resumen",
        component: () => import("../views/Resumen.vue"),
      },
      {
        path: "grupos",
        component: () => import("../views/Grupos.vue"),
      },
      {
        path: "calendario",
        component: () => import("../views/Calendario.vue"),
      },
      {
        path: "ajustes",
        component: () => import("../views/Ajustes.vue"),
      },
    ],
  },
  {
    path: "/login",
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Protección de rutas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else {
    next();
  }
});

export default router;
