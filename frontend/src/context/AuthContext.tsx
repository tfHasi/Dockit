import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';

export interface User {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    console.log('API URL:', API);
    if (!API) {
      console.error('NEXT_PUBLIC_API_URL environment variable is not set');
    }
  }, [API]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await res.json();
      setUser(data.user);
      router.push('/chat');
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, nickname: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Sending registration request to:', `${API}/auth/register`);
      
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nickname, password }),
      });
      
      // Log response info for debugging
      console.log('Registration response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Registration error response:', errorData);
        throw new Error(errorData.message || `Registration failed with status ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Registration success response:', data);
      
      router.push('/login');
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      });
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
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
      {children}
    </AuthContext.Provider>
  );
}