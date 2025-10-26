import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api';

export default function RegisterPage(): React.ReactNode {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        setIsLoading(true);
        try {
            await api.registerUser({ name: formData.name, email: formData.email, password: formData.password });
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || "L'inscription a échoué.");
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isSuccess) {
        return (
            <div className="w-full mx-auto px-4 py-20 sm:px-6 lg:px-8 flex justify-center items-center min-h-screen bg-expert-light-gray">
              <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl text-center">
                 <h1 className="text-3xl font-bold font-heading text-expert-green mb-4">Inscription Réussie !</h1>
                 <p className="text-gray-700 mb-6">
                    Votre compte a été créé. Un administrateur va maintenant examiner votre demande. Vous recevrez une notification par email une fois votre compte approuvé.
                 </p>
                 <Link to="/connexion" className="bg-expert-blue hover:bg-expert-blue/90 text-white font-bold py-2 px-4 rounded transition duration-300">
                    Retour à la page de connexion
                 </Link>
              </div>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto px-4 py-20 sm:px-6 lg:px-8 flex justify-center items-center min-h-screen bg-expert-light-gray">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
                <header className="text-center mb-8">
                     <Link to="/" className="inline-block mb-4">
                        <span className="self-center text-2xl font-heading font-semibold whitespace-nowrap text-expert-blue">
                            <i className="fas fa-car-burst mr-2"></i>Démolition Expert
                        </span>
                    </Link>
                    <h1 className="text-3xl font-bold font-heading text-expert-blue">Créer un compte</h1>
                    <p className="text-gray-600 mt-2">Rejoignez-nous pour accéder aux offres exclusives.</p>
                </header>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
                        <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-expert-blue focus:border-expert-blue" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-expert-blue focus:border-expert-blue" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                        <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-expert-blue focus:border-expert-blue" />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                        <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-expert-blue focus:border-expert-blue" />
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                            <p>{error}</p>
                        </div>
                    )}

                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-expert-green hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-expert-green disabled:bg-gray-400">
                            {isLoading ? 'Inscription...' : "S'inscrire"}
                        </button>
                    </div>
                </form>
                 <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Déjà un compte ? <Link to="/connexion" className="font-medium text-expert-green hover:underline">Connectez-vous</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}