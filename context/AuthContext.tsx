import React, { createContext, useState, useContext, useEffect } from 'react';
import { http } from '../services/http';
import type { User } from '../types';
import * as api from '../api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // In local mode, check localStorage for user session
        if (import.meta.env.VITE_USE_LOCAL_API === 'true') {
          const savedUser = localStorage.getItem('demoexpert_user');
          setUser(savedUser ? JSON.parse(savedUser) : null);
        } else {
          const me = await http<User>('auth/me');
          setUser(me || null);
        }
      } catch (error) {
        console.warn("Failed to fetch user session:", error);
        // Not authenticated, which is fine
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    if (import.meta.env.VITE_USE_LOCAL_API === 'true') {
      // Use local authentication
      const loggedInUser = await api.loginUser(email, password);
      setUser(loggedInUser);
      localStorage.setItem('demoexpert_user', JSON.stringify(loggedInUser));
    } else {
      const loggedInUser = await http<User>('auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setUser(loggedInUser);
    }
  };

  const logout = () => {
    (async () => {
      if (import.meta.env.VITE_USE_LOCAL_API === 'true') {
        // Local mode: just clear localStorage
        localStorage.removeItem('demoexpert_user');
      } else {
        try { await http('auth/logout', { method: 'POST' }); } catch (error) {
          console.warn("Failed to logout:", error);
        }
      }
      setUser(null);
    })();
  };

  const updateUser = (updatedUser: User) => {
      setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    isLoading, // To prevent route flicker on load
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Always render children, even when loading, to prevent blank page */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};