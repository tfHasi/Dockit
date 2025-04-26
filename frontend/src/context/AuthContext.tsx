import { createContext, useContext, useState, ReactNode } from 'react';
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
  const [isLoading, setIsLoading] = useState(false); // Changed to false since we're not loading initially
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL!;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const { user: u } = await res.json();
    setUser(u);
    router.push('/chat');
    setIsLoading(false);
  };

  const register = async (email: string, nickname: string, password: string) => {
    setIsLoading(true);
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nickname, password }),
    });
    if (!res.ok) throw new Error('Registration failed');
    router.push('/login');
    setIsLoading(false);
  };

  const logout = async () => {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    router.push('/login');
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