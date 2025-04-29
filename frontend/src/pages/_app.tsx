import { AppProps } from 'next/app';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { initSocket, disconnectSocket, initSocketWithDelay } from '../lib/socket';
import { useEffect } from 'react';
import '../styles/globals.css';

function InnerApp({ Component, pageProps }: AppProps) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      initSocketWithDelay();
    } else {
      disconnectSocket();
    }

    return () => {
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