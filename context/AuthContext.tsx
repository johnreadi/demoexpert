import React, { createContext, useState, useContext, useEffect } from 'react';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user in session storage on initial load
    try {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
    } catch(e) {
        console.error("Could not parse user from session storage", e);
        sessionStorage.removeItem('user');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = await api.loginUser(email, password);
    setUser(loggedInUser);
    sessionStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  const updateUser = (updatedUser: User) => {
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
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
      {!isLoading && children}
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