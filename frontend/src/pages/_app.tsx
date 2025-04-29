// pages/_app.tsx
import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { initSocket, disconnectSocket } from '../lib/socket';
import '../styles/globals.css';

function InnerApp({ Component, pageProps }: AppProps) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated) {
      initSocket()
        .then((socket) => {
          if (isMounted) {
            console.log('📡 Emitting getOnlineUsers after login');
            socket.emit('getOnlineUsers');
          }
        })
        .catch((err) => {
          console.error('Failed to initialize socket:', err.message);
        });
    } else {
      disconnectSocket();
    }

    return () => {
      isMounted = false;
      disconnectSocket();
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