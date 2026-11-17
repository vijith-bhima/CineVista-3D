'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Load user session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cinevista_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse stored auth user', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!res.ok) {
        let msg = 'Invalid username or password';
        try {
          const data = await res.json();
          if (data && data.error) msg = data.error;
        } catch {}
        return { success: false, error: msg };
      }

      const loggedUser: User = await res.json();
      setUser(loggedUser);
      localStorage.setItem('cinevista_auth_user', JSON.stringify(loggedUser));
      closeAuthModal();
      return { success: true };
    } catch (err: unknown) {
      // Fallback for standalone demo when backend is offline
      if (username.toLowerCase() === 'demo' && password === 'demo123') {
        const demoUser: User = {
          id: 1,
          username: 'demo',
          email: 'demo@cinevista.com',
          role: 'user',
          createdAt: new Date().toISOString(),
        };
        setUser(demoUser);
        localStorage.setItem('cinevista_auth_user', JSON.stringify(demoUser));
        closeAuthModal();
        return { success: true };
      }
      return { success: false, error: 'Connection error. Please ensure backend is running or use demo/demo123.' };
    }
  };

  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!res.ok) {
        let msg = 'Registration failed';
        try {
          const data = await res.json();
          if (data && data.error) msg = data.error;
        } catch {}
        return { success: false, error: msg };
      }

      const newUser: User = await res.json();
      setUser(newUser);
      localStorage.setItem('cinevista_auth_user', JSON.stringify(newUser));
      closeAuthModal();
      return { success: true };
    } catch (err: unknown) {
      // Fallback for client demo
      const fallbackUser: User = {
        id: Math.floor(1000 + Math.random() * 9000),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      localStorage.setItem('cinevista_auth_user', JSON.stringify(fallbackUser));
      closeAuthModal();
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cinevista_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authMode,
        setAuthMode,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
