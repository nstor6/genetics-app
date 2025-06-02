<template>
  <div class="notification-center">
    <!-- Botón de notificaciones -->
    <button @click="togglePanel" class="notification-button">
      🔔
      <span v-if="unreadCount > 0" class="notification-badge">
        {{ unreadCount > 99 ? "99+" : unreadCount }}
      </span>
    </button>

    <!-- Panel de notificaciones -->
    <div v-if="showPanel" class="notification-panel">
      <div class="notification-header">
        <h3>Notificaciones</h3>
        <div class="notification-actions">
          <span :class="['connection-status', isConnected ? 'connected' : 'disconnected']">
            {{ isConnected ? "🟢 Conectado" : "🔴 Desconectado" }}
          </span>
          <button @click="togglePanel" class="close-btn">×</button>
        </div>
      </div>

      <div class="notification-list" v-if="notifications.length > 0">
        <div
          v-for="notification in notifications.slice(0, 20)"
          :key="notification.id"
          :class="['notification-item', notification.tipo, { unread: !notification.visto }]"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon">
            {{ getNotificationIcon(notification.tipo) }}
          </div>
          <div class="notification-content">
            <p class="notification-message">{{ notification.mensaje }}</p>
            <small class="notification-time">
              {{ formatTime(notification.fecha_creacion) }}
            </small>
          </div>
          <div v-if="!notification.visto" class="unread-indicator"></div>
        </div>
      </div>

      <div v-else class="no-notifications">
        <p>No hay notificaciones</p>
      </div>

      <div class="notification-footer">
        <button @click="requestNotificationPermission" class="permission-btn">
          🔔 Habilitar notificaciones del navegador
        </button>
      </div>
    </div>

    <!-- Overlay para cerrar panel -->
    <div v-if="showPanel" class="notification-overlay" @click="togglePanel"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useNotifications } from "../composables/useWebSocket.js";

const showPanel = ref(false);
const { notifications, unreadCount, isConnected, markAsRead, requestPermission } = useNotifications();

const togglePanel = () => {
  showPanel.value = !showPanel.value;
};

const getNotificationIcon = (tipo) => {
  const icons = {
    informativa: "ℹ️",
    alerta_sanitaria: "🚨",
    recordatorio: "⏰",
  };
  return icons[tipo] || "ℹ️";
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return "Ahora";
  if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
  return date.toLocaleDateString();
};

const requestNotificationPermission = async () => {
  const granted = await requestPermission();
  if (granted) {
    alert("✅ Notificaciones habilitadas");
  } else {
    alert("❌ Notificaciones denegadas");
  }
};

onMounted(() => {
  // Solicitar permisos al cargar
  requestNotificationPermission();
});
</script>

<style scoped>
.notification-center {
  position: relative;
}

.notification-button {
  position: relative;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-button:hover {
  background: #2980b9;
  transform: scale(1.1);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.notification-panel {
  position: absolute;
  top: 60px;
  right: 0;
  width: 350px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: hidden;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.notification-header h3 {
  margin: 0;
  color: #2c3e50;
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.connection-status {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.connection-status.connected {
  background: #d5f4e6;
  color: #27ae60;
}

.connection-status.disconnected {
  background: #fadbd8;
  color: #e74c3c;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.close-btn:hover {
  color: #495057;
}

.notification-list {
  max-height: 350px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.unread {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.notification-item.alerta_sanitaria {
  border-left-color: #dc3545;
}

.notification-item.informativa {
  border-left-color: #17a2b8;
}

.notification-item.recordatorio {
  border-left-color: #28a745;
}

.notification-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-message {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
  line-height: 1.4;
}

.notification-time {
  color: #6c757d;
  font-size: 0.75rem;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: #007bff;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.no-notifications {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
}

.notification-footer {
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.permission-btn {
  width: 100%;
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s;
}

.permission-btn:hover {
  background: #218838;
}

.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

/* Responsive */
@media (max-width: 768px) {
  .notification-panel {
    width: 300px;
    right: -50px;
  }
}
</style>
