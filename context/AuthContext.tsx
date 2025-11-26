import React, { createContext, useState, useContext, useEffect } from 'react';
import { http } from '../services/http';
import type { User } from '../types';

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
        const me = await http<User>('auth/me');
        setUser(me || null);
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
    const loggedInUser = await http<User>('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setUser(loggedInUser);
  };

  const logout = () => {
    (async () => {
      try { await http('auth/logout', { method: 'POST' }); } catch (error) {
        console.warn("Failed to logout:", error);
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