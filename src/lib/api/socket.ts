import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let pingInterval: NodeJS.Timeout | null = null;

export const initializeSocket = (appId: string) => {
  // Prevent multiple connections
  if (socket?.connected) {
    return socket;
  }

  const API_URL = import.meta.env.VITE_BACKEND_URL;

  socket = io(API_URL, {
    // Force WebSocket transport only (no HTTP long-polling fallback)
    transports: ['websocket'],
    
    // Authentication
    auth: {
      appId,
      token: localStorage.getItem('auth_token'), // If you have auth tokens
    },
    
    // Connection settings
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    
    // Channel naming
    query: {
      appId,
    },
  });

  // Connection events
  socket.on('connect', () => {
    console.log(`Socket connected with ID: ${socket?.id}`);
    // Emit join to subscribe to this app's room
    if (socket && appId) {
      socket.emit('join',  appId , (ack: any) => {
        console.log('Joined app room:', appId, 'Ack:', ack);
      });
    }

    // Start ping interval every second
    if (pingInterval) clearInterval(pingInterval);
    pingInterval = setInterval(() => {
      if (socket?.connected) {
        socket.emit('ping');
      }
    }, 1000);
    console.log('🔄 Ping interval started');
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    // Clear ping interval on disconnect
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
      console.log('🔄 Ping interval stopped');
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitEvent = (event: string, data: any) => {
  if (socket?.connected) {
    socket.emit(event, data);
  }
};

export const onEvent = (event: string, callback: (data: any) => void) => {
  if (socket) {
    console.log(`[socket] onEvent registered: "${event}" (socket connected=${socket.connected})`);
    socket.on(event, callback);
  } else {
    console.warn(`[socket] onEvent called for "${event}" but socket is NULL — listener NOT registered`);
  }
};

export const offEvent = (event: string, callback?: (data: any) => void) => {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }
};

/**
 * Join an app-specific room for targeted event listening
 * Called automatically on connect, but can be called explicitly if needed
 */
export const joinRoom = (appId: string) => {
  if (socket?.connected) {
    socket.emit('join', appId, (ack: any) => {
      console.log('Joined room for app:', appId);
    });
  }
};

/**
 * Leave an app-specific room
 */
export const leaveRoom = (appId: string) => {
  if (socket?.connected) {
    socket.emit('leave', appId, (ack: any) => {
      console.log('Left room for app:', appId);
    });
  }
};

/**
 * Check if socket is currently connected
 */
export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};

/**
 * Get current socket connection status info
 */
export const getSocketStatus = () => {
  return {
    connected: socket?.connected ?? false,
    socketId: socket?.id ?? null,
    url: socket?.io?.uri ?? null,
  };
};