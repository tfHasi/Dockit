import { useState, useEffect } from 'react';
import { AppProps } from 'next/app';
import { createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';

interface User {
  userId: string;
  email: string;
  nickname: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, nickname: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isAuthenticated: false
});

export const useAuth = () => useContext(AuthContext);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function MyApp({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include',
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          if (router.pathname === '/chat') {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      router.push('/chat');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, nickname: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, nickname, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      router.push('/login');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}

export default MyApp;