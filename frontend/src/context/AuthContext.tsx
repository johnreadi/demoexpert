import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as api from '../api';
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // État strictement volatile : aucune persistance dans le navigateur.
  // L'utilisateur est déconnecté au rafraîchissement de la page ou fermeture d'onglet.
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pas de useEffect pour charger depuis sessionStorage car on veut bloquer la persistance.

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await api.loginUser(email, password);
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
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
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
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