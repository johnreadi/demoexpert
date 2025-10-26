
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';

export default function WindshieldPage(): React.ReactNode {
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        vehicle: '',
        year: '',
        immatriculation: '',
        damageType: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.submitWindshieldRequest(formData);
            setSubmitted(true);
        } catch (error) {
            console.error("Failed to submit windshield request", error);
            alert("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl text-center">
                    <h1 className="text-3xl font-bold font-heading text-expert-green mb-4">Demande Envoyée !</h1>
                    <p className="mb-6">Merci, {formData.name}. Votre demande de devis pour votre pare-brise a bien été prise en compte. Notre équipe vous contactera très prochainement.</p>
                    <Link to="/" className="bg-expert-blue hover:bg-expert-blue/80 text-white font-bold py-2 px-4 rounded transition duration-300">
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Section */}
            <div className="relative bg-expert-blue text-white overflow-hidden">
                <div className="absolute inset-0">
                    <img src="https://picsum.photos/seed/windshield-bg/1920/1080" alt="Réparation de pare-brise" className="w-full h-full object-cover opacity-30" />
                </div>
                <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">Remplacement & Réparation de Pare-Brise</h1>
                    <p className="text-lg md:text-2xl">Visibilité et sécurité maximales avec notre service expert.</p>
                </div>
            </div>

            <div className="w-full mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Info Section */}
                    <div>
                        <h2 className="text-3xl font-bold font-heading text-expert-blue mb-6">Un service complet pour votre visibilité</h2>
                        <p className="text-lg mb-6">Un impact ou une fissure sur votre pare-brise ? N'attendez pas que les dégâts s'aggravent. Chez Démolition Expert, nous évaluons rapidement les dommages et proposons la meilleure solution, qu'il s'agisse d'une réparation ou d'un remplacement complet.</p>
                        
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <i className="fas fa-hammer text-expert-green text-2xl mr-4 mt-1"></i>
                                <div>
                                    <h3 className="text-xl font-bold text-expert-blue">Réparation d'impact</h3>
                                    <p>Pour les petits impacts (moins d'une pièce de 2€), une injection de résine spéciale peut suffire à solidifier le verre et éviter que la fissure ne s'étende. C'est rapide et économique.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <i className="fas fa-sync-alt text-expert-green text-2xl mr-4 mt-1"></i>
                                <div>
                                    <h3 className="text-xl font-bold text-expert-blue">Remplacement de Pare-Brise</h3>
                                    <p>Si la fissure est trop importante ou dans le champ de vision, nous remplaçons votre pare-brise avec des pièces de qualité équivalente à l'origine, garantissant une sécurité optimale.</p>
                                </div>
                            </div>
                        </div>
                         <div className="mt-8 bg-expert-light-gray p-6 rounded-lg">
                            <h3 className="text-xl font-bold text-expert-blue mb-2"><i className="fas fa-shield-alt mr-2"></i> Compatible toutes assurances</h3>
                            <p>Nous travaillons avec la plupart des compagnies d'assurance. Selon votre contrat, l'intervention peut être prise en charge (hors franchise éventuelle).</p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="bg-white p-8 rounded-lg shadow-xl">
                        <h2 className="text-2xl font-bold font-heading text-center text-expert-blue mb-6">Demander un devis gratuit</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="name" placeholder="Nom complet" onChange={handleChange} required className="w-full p-3 border rounded focus:ring-expert-blue focus:border-expert-blue" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="phone" type="tel" placeholder="Téléphone" onChange={handleChange} required className="w-full p-3 border rounded focus:ring-expert-blue focus:border-expert-blue" />
                                <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full p-3 border rounded focus:ring-expert-blue focus:border-expert-blue" />
                            </div>
                             <input name="vehicle" placeholder="Marque & Modèle du véhicule" onChange={handleChange} required className="w-full p-3 border rounded focus:ring-expert-blue focus:border-expert-blue" />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="year" type="number" placeholder="Année" onChange={handleChange} required className="w-full p-3 border rounded focus:ring-expert-blue focus:border-expert-blue" />
                                <input name="immatriculation" placeholder="Immatriculation" onChange={handleChange} required className="w-full p-3 border rounded focus:ring-expert-blue focus:border-expert-blue" />
                            </div>
                            <div>
                                <select name="damageType" onChange={handleChange} required className="w-full p-3 border rounded bg-white focus:ring-expert-blue focus:border-expert-blue">
                                    <option value="">-- Type de dommage --</option>
                                    <option value="Impact (< 2cm)">Impact (moins de 2cm)</option>
                                    <option value="Fissure">Fissure</option>
                                    <option value="Remplacement complet">Remplacement complet</option>
                                    <option value="Autre">Autre (précisez ci-dessous)</option>
                                </select>
                            </div>
                            <textarea name="message" placeholder="Informations complémentaires (ex: présence d'un capteur de pluie)" rows={3} onChange={handleChange} className="w-full p-3 border rounded focus:ring-expert-blue focus:border-expert-blue"></textarea>
                            <button type="submit" disabled={isLoading} className="w-full bg-expert-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 disabled:bg-gray-400">
                                {isLoading ? 'Envoi en cours...' : 'Obtenir mon devis'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
