class WebSocketService {
  constructor() {
    this.connections = new Map();
    this.baseUrl = "ws://localhost:8000/ws";
    this.reconnectInterval = 5000;
    this.maxReconnectAttempts = 5;
  }

  // Conectar a un canal específico
  connect(channel, callbacks = {}) {
    if (this.connections.has(channel)) {
      console.log(`Ya conectado al canal: ${channel}`);
      return this.connections.get(channel);
    }

    const url = `${this.baseUrl}/${channel}/`;
    const ws = new WebSocket(url);

    const connection = {
      ws,
      channel,
      reconnectAttempts: 0,
      callbacks: {
        onOpen: callbacks.onOpen || (() => {}),
        onMessage: callbacks.onMessage || (() => {}),
        onError: callbacks.onError || (() => {}),
        onClose: callbacks.onClose || (() => {}),
      },
    };

    ws.onopen = (event) => {
      console.log(`✅ Conectado a WebSocket: ${channel}`);
      connection.reconnectAttempts = 0;
      connection.callbacks.onOpen(event);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`📨 Mensaje de ${channel}:`, data);
        connection.callbacks.onMessage(data);
      } catch (error) {
        console.error("Error parseando mensaje WebSocket:", error);
      }
    };

    ws.onerror = (error) => {
      console.error(`❌ Error en WebSocket ${channel}:`, error);
      connection.callbacks.onError(error);
    };

    ws.onclose = (event) => {
      console.log(`🔌 Desconectado de WebSocket: ${channel}`);
      this.connections.delete(channel);
      connection.callbacks.onClose(event);

      // Auto-reconectar si no fue cierre intencional
      if (!event.wasClean && connection.reconnectAttempts < this.maxReconnectAttempts) {
        connection.reconnectAttempts++;
        console.log(`🔄 Reintentando conexión ${connection.reconnectAttempts}/${this.maxReconnectAttempts}`);
        setTimeout(() => {
          this.connect(channel, callbacks);
        }, this.reconnectInterval);
      }
    };

    this.connections.set(channel, connection);
    return connection;
  }

  // Desconectar de un canal
  disconnect(channel) {
    const connection = this.connections.get(channel);
    if (connection) {
      connection.ws.close();
      this.connections.delete(channel);
      console.log(`🔌 Desconectado manualmente de: ${channel}`);
    }
  }

  // Desconectar de todos los canales
  disconnectAll() {
    this.connections.forEach((connection, channel) => {
      connection.ws.close();
    });
    this.connections.clear();
    console.log("🔌 Todas las conexiones WebSocket cerradas");
  }

  // Enviar mensaje a un canal
  send(channel, message) {
    const connection = this.connections.get(channel);
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message));
      return true;
    }
    console.warn(`No se pudo enviar mensaje a ${channel}: conexión no disponible`);
    return false;
  }

  // Verificar estado de conexión
  isConnected(channel) {
    const connection = this.connections.get(channel);
    return connection && connection.ws.readyState === WebSocket.OPEN;
  }
}

// Exportar instancia singleton
export default new WebSocketService();
