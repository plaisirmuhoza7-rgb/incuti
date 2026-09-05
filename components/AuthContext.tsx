'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Farm } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  farm: Farm | null;
  isLoading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  login: (name: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshFarm: () => Promise<void>;
  updateCurrentFarm: (farm: Farm) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Initialize auth from localStorage and /api/auth/me
  useEffect(() => {
    async function initAuth() {
      try {
        const storedUser = localStorage.getItem('incuti_user');
        const storedFarm = localStorage.getItem('incuti_farm');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedFarm) {
          setFarm(JSON.parse(storedFarm));
        }

        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('incuti_user', JSON.stringify(data.user));
            if (data.farm) {
              setFarm(data.farm);
              localStorage.setItem('incuti_farm', JSON.stringify(data.farm));
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch initial session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (name: string, phone: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('incuti_user', JSON.stringify(data.user));
        if (data.farm) {
          setFarm(data.farm);
          localStorage.setItem('incuti_farm', JSON.stringify(data.farm));
        } else {
          setFarm(null);
          localStorage.removeItem('incuti_farm');
        }
        setShowAuthModal(false);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Habaye ikibazo mu kwinjira.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Habaye ikibazo mu kwinjira.' };
    }
  };

  const logout = () => {
    setUser(null);
    setFarm(null);
    localStorage.removeItem('incuti_user');
    localStorage.removeItem('incuti_farm');
    document.cookie = 'incuti_user_id=; Max-Age=0; path=/;';
  };

  const refreshFarm = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/farm?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.farm) {
          setFarm(data.farm);
          localStorage.setItem('incuti_farm', JSON.stringify(data.farm));
        }
      }
    } catch (err) {
      console.warn('Error refreshing farm:', err);
    }
  };

  const updateCurrentFarm = (newFarm: Farm) => {
    setFarm(newFarm);
    localStorage.setItem('incuti_farm', JSON.stringify(newFarm));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        farm,
        isLoading,
        showAuthModal,
        setShowAuthModal,
        login,
        logout,
        refreshFarm,
        updateCurrentFarm,
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
