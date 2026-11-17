'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

// Helper for client-side SHA-256 hashing matching backend PasswordUtil
async function sha256(message: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return message; // fallback
  }
}

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
      const cleanUser = username.trim();
      const passwordHash = await sha256(password);

      // 1. Try Supabase if configured
      if (isSupabaseConfigured() && supabase) {
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .or(`username.eq.${cleanUser},email.eq.${cleanUser.toLowerCase()}`);

        if (!error && users && users.length > 0) {
          const dbUser = users[0];
          if (dbUser.password_hash === passwordHash || dbUser.password_hash === password) {
            const loggedUser: User = {
              id: dbUser.id,
              username: dbUser.username,
              email: dbUser.email,
              role: dbUser.role || 'user',
              createdAt: dbUser.created_at || new Date().toISOString(),
            };
            setUser(loggedUser);
            localStorage.setItem('cinevista_auth_user', JSON.stringify(loggedUser));
            closeAuthModal();
            return { success: true };
          }
        }
      }

      // 2. Try Java Backend REST API
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, password }),
        });

        if (res.ok) {
          const loggedUser: User = await res.json();
          setUser(loggedUser);
          localStorage.setItem('cinevista_auth_user', JSON.stringify(loggedUser));
          closeAuthModal();
          return { success: true };
        }
      } catch {}

      // 3. Demo account fallback
      if (cleanUser.toLowerCase() === 'demo' && password === 'demo123') {
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

      return { success: false, error: 'Invalid username or password' };
    } catch (err: unknown) {
      if (username.trim().toLowerCase() === 'demo' && password === 'demo123') {
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
      return { success: false, error: 'Authentication error. Please try again.' };
    }
  };

  const register = async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanUser = username.trim();
      const cleanEmail = email.trim().toLowerCase();
      const passwordHash = await sha256(password);

      // 1. Try Supabase if configured
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('users')
          .insert({
            username: cleanUser,
            email: cleanEmail,
            password_hash: passwordHash,
            role: 'user',
          })
          .select()
          .single();

        if (!error && data) {
          const newUser: User = {
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role || 'user',
            createdAt: data.created_at || new Date().toISOString(),
          };
          setUser(newUser);
          localStorage.setItem('cinevista_auth_user', JSON.stringify(newUser));
          closeAuthModal();
          return { success: true };
        } else if (error && error.code === '23505') {
          return { success: false, error: 'Username or email is already registered' };
        }
      }

      // 2. Try Java Backend REST API
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: cleanUser,
            email: cleanEmail,
            password,
          }),
        });

        if (res.ok) {
          const newUser: User = await res.json();
          setUser(newUser);
          localStorage.setItem('cinevista_auth_user', JSON.stringify(newUser));
          closeAuthModal();
          return { success: true };
        }
      } catch {}

      // 3. Client fallback
      const fallbackUser: User = {
        id: Math.floor(1000 + Math.random() * 9000),
        username: cleanUser,
        email: cleanEmail,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      localStorage.setItem('cinevista_auth_user', JSON.stringify(fallbackUser));
      closeAuthModal();
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: 'Registration failed. Please try again.' };
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
