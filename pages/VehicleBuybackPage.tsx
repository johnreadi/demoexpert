

import React, { useState } from 'react';
import * as api from '../api';

const Step: React.FC<{ currentStep: number; stepNumber: number; title: string; children: React.ReactNode }> = ({ currentStep, stepNumber, title, children }) => {
    if (currentStep !== stepNumber) return null;
    return (
        <div>
            <h2 className="text-2xl font-bold font-heading text-expert-blue mb-4">{title}</h2>
            {children}
        </div>
    );
};

export default function VehicleBuybackPage(): React.ReactNode {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        brand: '', model: '', year: '', km: '',
        immatriculation: '',
        couleur: '',
        etatGeneral: 'Occasion',
        options: '',
        condition: '', description: '',
        montantSouhaite: '',
        name: '', email: '', phone: '', address: ''
    });
    const [estimation, setEstimation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setIsSubmitted(true); // Move to final screen immediately
        try {
            const result = await api.submitBuybackRequest(formData);
            setEstimation(result.estimation);
        } catch(error) {
            console.error("Failed to submit buyback request", error);
            setEstimation("Impossible de générer une estimation pour le moment. Notre équipe vous contactera directement.");
        } finally {
            setIsLoading(false);
        }
    };

    const totalSteps = 3;

    if (isSubmitted) {
        return (
             <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl text-center">
                    <h1 className="text-3xl font-bold font-heading text-expert-green mb-4">Demande Envoyée !</h1>
                    <p className="mb-6">Merci, {formData.name}. Votre demande de rachat a bien été reçue. Nous vous contacterons très prochainement à l'adresse {formData.email} ou par téléphone au {formData.phone}.</p>
                    <div className="bg-gray-100 p-6 rounded-lg border">
                        <h2 className="text-xl font-bold text-expert-blue mb-2">Estimation Préliminaire</h2>
                         {isLoading ? (
                            <p className="animate-pulse">Génération de l'estimation en cours...</p>
                        ) : (
                            <p className="text-gray-700">{estimation}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold font-heading text-expert-blue">Rachat de Véhicule</h1>
                    <p className="text-lg mt-2">Obtenez une offre gratuite pour votre voiture en quelques étapes.</p>
                </header>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                    <div className="bg-expert-green h-2.5 rounded-full" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Step currentStep={step} stepNumber={1} title="Étape 1: Infos Véhicule">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="brand" placeholder="Marque (ex: Renault)" onChange={handleChange} required className="p-3 border rounded"/>
                            <input name="model" placeholder="Modèle (ex: Clio)" onChange={handleChange} required className="p-3 border rounded"/>
                            <input name="year" type="number" placeholder="Année (ex: 2010)" onChange={handleChange} required className="p-3 border rounded"/>
                            <input name="km" type="number" placeholder="Kilométrage" onChange={handleChange} required className="p-3 border rounded"/>
                            <input name="couleur" placeholder="Couleur (ex: Gris)" onChange={handleChange} className="p-3 border rounded"/>
                            <select name="etatGeneral" value={formData.etatGeneral} onChange={handleChange} className="p-3 border rounded bg-white">
                                <option value="Occasion">Occasion</option>
                                <option value="Neuf">Neuf</option>
                            </select>
                            <input name="immatriculation" placeholder="Immatriculation (ex: AA-123-BB)" onChange={handleChange} required className="p-3 border rounded md:col-span-2"/>
                             <textarea name="options" placeholder="Options et équipements (ex: GPS, Toit ouvrant, Attelage...)" onChange={handleChange} rows={3} className="p-3 border rounded w-full md:col-span-2"></textarea>
                        </div>
                    </Step>

                    <Step currentStep={step} stepNumber={2} title="Étape 2: État du Véhicule">
                         <select name="condition" onChange={handleChange} required className="p-3 border rounded w-full mb-4">
                             <option value="">-- Sélectionnez l'état mécanique --</option>
                             <option value="roulant">Roulant</option>
                             <option value="en panne">En panne</option>
                             <option value="accidenté">Accidenté</option>
                             <option value="pour pièces">Pour pièces / Non roulant</option>
                         </select>
                         <input name="montantSouhaite" type="number" placeholder="Montant souhaité (€)" onChange={handleChange} className="p-3 border rounded w-full mb-4"/>
                         <textarea name="description" placeholder="Décrivez brièvement l'état général, les dommages éventuels..." onChange={handleChange} rows={4} className="p-3 border rounded w-full"></textarea>
                         <p className="text-sm mt-2 text-gray-500">Vous pourrez ajouter des photos ultérieurement si nécessaire.</p>
                    </Step>

                    <Step currentStep={step} stepNumber={3} title="Étape 3: Vos Coordonnées">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="name" placeholder="Nom complet" onChange={handleChange} required className="p-3 border rounded"/>
                            <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="p-3 border rounded"/>
                            <input name="phone" type="tel" placeholder="Téléphone" onChange={handleChange} required className="p-3 border rounded"/>
                            <input name="address" placeholder="Adresse (pour l'enlèvement)" onChange={handleChange} required className="p-3 border rounded"/>
                        </div>
                    </Step>
                    
                    <div className="mt-8 flex justify-between">
                        {step > 1 && <button type="button" onClick={prevStep} className="bg-expert-gray text-white py-2 px-6 rounded">Précédent</button>}
                        {step < totalSteps && <button type="button" onClick={nextStep} className="bg-expert-blue text-white py-2 px-6 rounded ml-auto">Suivant</button>}
                        {step === totalSteps && <button type="submit" disabled={isLoading} className="bg-expert-green text-white py-2 px-6 rounded ml-auto disabled:bg-gray-400">{isLoading ? 'Envoi...' : 'Obtenir mon offre'}</button>}
                    </div>
                </form>
            </div>
        </div>
    );
}
