import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

let socket: Socket | null = null;

export const initSocket = (): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    if (socket) {
      console.log('Socket already initialized');
      return resolve(socket);
    }

    console.log('Initializing socket connection to:', API_BASE_URL);

    socket = io(API_BASE_URL!, {
      autoConnect: true,
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected successfully:', socket.id);
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      reject(err);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
    });
  });
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    console.log('🔌 Disconnecting socket');
    socket.disconnect();
    socket = null;
  }
};