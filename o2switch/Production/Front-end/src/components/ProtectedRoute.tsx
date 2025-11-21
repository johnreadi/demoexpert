import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Chargement...</div>; // Ou un spinner de chargement
  }

  if (!isAuthenticated) {
    // Redirige vers la page de connexion, en sauvegardant l'emplacement actuel
    // pour pouvoir y revenir après la connexion.
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
