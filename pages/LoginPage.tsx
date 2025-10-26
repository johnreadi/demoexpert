

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage(): React.ReactNode {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await auth.login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'La connexion a échoué.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto px-4 py-20 sm:px-6 lg:px-8 flex justify-center items-center min-h-screen bg-expert-light-gray">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
        <header className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
             <span className="self-center text-2xl font-heading font-semibold whitespace-nowrap text-expert-blue">
                <i className="fas fa-car-burst mr-2"></i>Démolition Expert
            </span>
          </Link>
          <h1 className="text-3xl font-bold font-heading text-expert-blue">Connexion</h1>
          <p className="text-gray-600 mt-2">Accédez à votre compte ou à l'espace d'administration.</p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-expert-blue focus:border-expert-blue"
              placeholder="votre.email@exemple.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-expert-blue focus:border-expert-blue"
              placeholder="Votre mot de passe"
            />
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p>{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-expert-blue hover:bg-expert-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-expert-blue disabled:bg-gray-400"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Connexion...
                </>
              ) : "Se connecter"}
            </button>
          </div>
        </form>
         <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
                Pas encore de compte ? <Link to="/inscription" className="font-medium text-expert-green hover:underline">Inscrivez-vous ici</Link>
            </p>
        </div>
      </div>
    </div>
  );
}
