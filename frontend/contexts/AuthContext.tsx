'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { auth, setUnauthorizedHandler } from '@/lib/api';
import { UserResponse } from '@/lib/api/types';
import {
  clearAccessToken,
  getAccessToken,
  syncAuthCookie,
} from '@/lib/auth/token-storage';

interface AuthContextValue {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleUnauthorized = useCallback(() => {
    clearAccessToken();
    setUser(null);
    router.replace('/login?expired=1');
  }, [router]);

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);

    async function bootstrapSession() {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      syncAuthCookie();

      try {
        const response = await auth.me();
        setUser(response.data);
      } catch {
        clearAccessToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    bootstrapSession();

    return () => setUnauthorizedHandler(null);
  }, [handleUnauthorized]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await auth.login(email, password);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch {
      clearAccessToken();
    } finally {
      setUser(null);
      router.replace('/login');
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
