import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useServices } from './ServicesContext';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; emailNotVerified?: boolean }>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (params: {
    tokenHash: string;
    type: 'recovery' | 'signup' | 'invite' | 'email' | 'email_change';
  }) => Promise<{ error?: string }>;
  exchangeCodeForSession: (code: string) => Promise<{ error?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache admin status to avoid repeated DB calls
const adminCache = new Map<string, { isAdmin: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = useServices();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkIsAdmin = async (email: string): Promise<boolean> => {
    const cached = adminCache.get(email);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.isAdmin;
    }
    const result = await auth.checkIsAdmin(email);
    adminCache.set(email, { isAdmin: result, timestamp: Date.now() });
    return result;
  };

  useEffect(() => {
    let mounted = true;

    auth.getSession().then(async (sessionUser) => {
      if (!mounted) return;

      if (sessionUser) {
        setUser(sessionUser);
        const adminStatus = await checkIsAdmin(sessionUser.email);
        if (mounted) {
          setIsAdmin(adminStatus);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    const { unsubscribe } = auth.onAuthStateChange(async (sessionUser) => {
      if (!mounted) return;

      if (sessionUser) {
        setUser(sessionUser);
        // TODO: try to remove this delay if possible
        setTimeout(async () => {
          if (!mounted) return;
          const adminStatus = await checkIsAdmin(sessionUser.email);
          setIsAdmin(adminStatus);
        }, 100);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [auth]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; emailNotVerified?: boolean }> => {
    setLoading(true);
    try {
      const result = await auth.signIn(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        const adminStatus = await checkIsAdmin(result.user.email);
        setIsAdmin(adminStatus);
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await auth.signUp(email, password, {
        redirectTo: `${globalThis.location.origin}/verify-email?verification=1`,
      });
      if (result.error) throw new Error(result.error);
      return result.success;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await auth.signOut();
    if (user?.email) adminCache.delete(user.email);
    setUser(null);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) =>
    auth.resetPassword(email, {
      redirectTo: `${globalThis.location.origin}/reset-password`,
    });

  const updatePassword = async (password: string) => auth.updatePassword(password);

  const verifyOtp = async (params: {
    tokenHash: string;
    type: 'recovery' | 'signup' | 'invite' | 'email' | 'email_change';
  }) => auth.verifyOtp(params);

  const exchangeCodeForSession = async (code: string) => auth.exchangeCodeForSession(code);

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      login,
      register,
      logout,
      resetPassword,
      updatePassword,
      verifyOtp,
      exchangeCodeForSession,
      loading,
    }),
    [user, isAdmin, loading, auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
