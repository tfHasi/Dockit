import { AppProps } from "next/app";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { initSocket, disconnectSocket } from "../lib/socket";
import { useEffect } from "react";
import '../styles/globals.css';

function InnerApp({ Component, pageProps }: AppProps) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      initSocket();
    } else {
      disconnectSocket();
    }
    // clean up on unmount
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