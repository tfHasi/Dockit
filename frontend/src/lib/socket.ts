// 1. Modified socket.ts - Focus on delayed initialization after login
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  // Add a slight delay to ensure cookies are set before connecting
  if (!socket) {
    console.log('Initializing socket connection to:', API_BASE_URL);
    
    socket = io(API_BASE_URL, {
      autoConnect: true,
      withCredentials: true,
    });

    socket.on('connect', function() {
      console.log('Socket connected successfully', socket.id);
      // Request online users list immediately after connection
      socket.emit('getOnlineUsers');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }
  
  return socket;
};

// Allow a slight delay before initializing socket to ensure cookie is set
export const initSocketWithDelay = () => {
  setTimeout(() => {
    initSocket();
  }, 300); // Small delay to ensure cookie is set
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};