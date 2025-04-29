import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { initSocket, disconnectSocket, getSocket } from '../lib/socket';
import '../styles/globals.css';

function InnerApp({ Component, pageProps }: AppProps) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const initializeSocket = async () => {
      try {
        await initSocket();
        const socket = getSocket();
        if (socket) {
          console.log('📡 Socket initialized, getting online users');
          socket.emit('getOnlineUsers');
        }
      } catch (err) {
        console.error('Socket initialization error:', err);
      }
    };

    initializeSocket();

    return () => {
    };
  }, [isAuthenticated]);

  return <Component {...pageProps} />;
}

export default function MyApp(props: AppProps) {
  return (
    <AuthProvider>
      <InnerApp {...props} />
    </AuthProvider>
  );
}