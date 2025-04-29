import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

let socket: Socket | null = null;

export const initSocket = async (): Promise<Socket> => {
  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.connect();
    return new Promise((resolve, reject) => {
      socket!.on('connect', () => resolve(socket!));
      socket!.on('connect_error', (err) => reject(err));
    });
  }

  console.log('Initializing new socket connection to:', API_BASE_URL);

  socket = io(API_BASE_URL!, {
    autoConnect: true,
    withCredentials: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return new Promise((resolve, reject) => {
    socket!.on('connect', () => {
      console.log('✅ Socket connected successfully:', socket!.id);
      resolve(socket!);
    });

    socket!.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      reject(err);
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