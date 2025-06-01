import { defineStore } from "pinia";
import { ref } from "vue";
import WebSocketService from "@/services/websocket";

export const useWebSocketStore = defineStore("websocket", () => {
  // Estado
  const isConnected = ref(false);
  const notifications = ref([]);
  const realtimeData = ref({
    animals: [],
    incidents: [],
    treatments: [],
    events: [],
    dashboardStats: {},
  });

  // Acciones
  const connectToChannels = (userId) => {
    // Conectar a notificaciones personales
    WebSocketService.connect(`notifications/${userId}`, {
      onMessage: (data) => {
        if (data.type === "notification") {
          addNotification(data.data);
        }
      },
    });

    // Conectar a actualizaciones de animales
    WebSocketService.connect("animals", {
      onMessage: (data) => {
        handleAnimalUpdate(data);
      },
    });

    // Conectar a actualizaciones de incidencias
    WebSocketService.connect("incidents", {
      onMessage: (data) => {
        handleIncidentUpdate(data);
      },
    });

    // Conectar a actualizaciones de tratamientos
    WebSocketService.connect("treatments", {
      onMessage: (data) => {
        handleTreatmentUpdate(data);
      },
    });

    // Conectar a actualizaciones de eventos
    WebSocketService.connect("events", {
      onMessage: (data) => {
        handleEventUpdate(data);
      },
    });

    // Conectar a actualizaciones del dashboard
    WebSocketService.connect("dashboard", {
      onMessage: (data) => {
        handleDashboardUpdate(data);
      },
    });

    isConnected.value = true;
  };

  const addNotification = (notification) => {
    notifications.value.unshift({
      id: Date.now(),
      ...notification,
      timestamp: new Date(),
      read: false,
    });

    // Mostrar notificación del navegador si está permitido
    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
      });
    }
  };

  const handleAnimalUpdate = (data) => {
    const { action, data: animalData } = data;

    switch (action) {
      case "created":
        realtimeData.value.animals.push(animalData);
        addNotification({
          type: "animal_created",
          title: "🐄 Nuevo Animal",
          message: `Animal ${animalData.chapeta} agregado al sistema`,
        });
        break;

      case "updated":
        const animalIndex = realtimeData.value.animals.findIndex((a) => a.id === animalData.id);
        if (animalIndex !== -1) {
          realtimeData.value.animals[animalIndex] = animalData;
        }
        addNotification({
          type: "animal_updated",
          title: "📝 Animal Actualizado",
          message: `Animal ${animalData.chapeta} ha sido modificado`,
        });
        break;

      case "deleted":
        realtimeData.value.animals = realtimeData.value.animals.filter((a) => a.id !== animalData.id);
        addNotification({
          type: "animal_deleted",
          title: "🗑️ Animal Eliminado",
          message: `Animal ${animalData.chapeta} eliminado del sistema`,
        });
        break;
    }
  };

  const handleIncidentUpdate = (data) => {
    const { action, data: incidentData } = data;

    switch (action) {
      case "created":
        realtimeData.value.incidents.push(incidentData);
        // Las notificaciones críticas se manejan desde el backend
        break;

      case "updated":
        const incidentIndex = realtimeData.value.incidents.findIndex((i) => i.id === incidentData.id);
        if (incidentIndex !== -1) {
          realtimeData.value.incidents[incidentIndex] = incidentData;
        }
        break;

      case "deleted":
        realtimeData.value.incidents = realtimeData.value.incidents.filter((i) => i.id !== incidentData.id);
        break;
    }
  };

  const handleTreatmentUpdate = (data) => {
    const { action, data: treatmentData } = data;

    switch (action) {
      case "created":
        realtimeData.value.treatments.push(treatmentData);
        break;

      case "updated":
        const treatmentIndex = realtimeData.value.treatments.findIndex((t) => t.id === treatmentData.id);
        if (treatmentIndex !== -1) {
          realtimeData.value.treatments[treatmentIndex] = treatmentData;
        }
        break;

      case "deleted":
        realtimeData.value.treatments = realtimeData.value.treatments.filter((t) => t.id !== treatmentData.id);
        break;
    }
  };

  const handleEventUpdate = (data) => {
    const { action, data: eventData } = data;

    switch (action) {
      case "created":
        realtimeData.value.events.push(eventData);
        addNotification({
          type: "event_created",
          title: "📅 Nuevo Evento",
          message: `Evento "${eventData.titulo}" programado`,
        });
        break;

      case "updated":
        const eventIndex = realtimeData.value.events.findIndex((e) => e.id === eventData.id);
        if (eventIndex !== -1) {
          realtimeData.value.events[eventIndex] = eventData;
        }
        break;

      case "deleted":
        realtimeData.value.events = realtimeData.value.events.filter((e) => e.id !== eventData.id);
        break;
    }
  };

  const handleDashboardUpdate = (data) => {
    realtimeData.value.dashboardStats = {
      ...realtimeData.value.dashboardStats,
      ...data.data,
    };
  };

  const markNotificationAsRead = (notificationId) => {
    const notification = notifications.value.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  };

  const clearNotifications = () => {
    notifications.value = [];
  };

  const disconnectAll = () => {
    WebSocketService.disconnectAll();
    isConnected.value = false;
  };

  return {
    // Estado
    isConnected,
    notifications,
    realtimeData,

    // Acciones
    connectToChannels,
    addNotification,
    markNotificationAsRead,
    clearNotifications,
    disconnectAll,
  };
});
