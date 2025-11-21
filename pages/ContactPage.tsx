import React, { useState } from 'react';
import * as api from '../api';
import { useSettings } from '../context/SettingsContext';
import LocationMap from '../components/LocationMap';

export default function ContactPage(): React.ReactNode {
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const { settings } = useSettings();

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.submitContactForm(formData);
            setSubmitted(true);
        } catch(error) {
            console.error("Failed to submit contact form", error);
            alert("Une erreur est survenue lors de l'envoi du message.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!settings) return <div className="text-center py-20">Chargement...</div>;

    return (
        <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold font-heading text-expert-blue">Contactez-nous</h1>
                <p className="text-lg mt-2">Une question ? Une demande spécifique ? Notre équipe est à votre écoute.</p>
            </header>
            
            <div className="grid md:grid-cols-2 gap-12 bg-white p-8 rounded-lg shadow-xl">
                <div>
                    <h2 className="text-2xl font-bold font-heading text-expert-blue mb-6">Nos Coordonnées</h2>
                    <div className="space-y-4 text-lg">
                        <p className="flex items-start"><i className="fas fa-location-dot text-expert-green mt-1 mr-4"></i><span>{settings.businessInfo.address}</span></p>
                        <p className="flex items-center"><i className="fas fa-phone text-expert-green mr-4"></i><a href={`tel:${settings.businessInfo.phone.replace(/\s/g, '')}`} className="hover:text-expert-green">{settings.businessInfo.phone}</a></p>
                        <p className="flex items-center"><i className="fas fa-envelope text-expert-green mr-4"></i><a href={`mailto:${settings.businessInfo.email}`} className="hover:text-expert-green">{settings.businessInfo.email}</a></p>
                        <p className="flex items-center"><i className="fas fa-clock text-expert-green mr-4"></i><span>{settings.businessInfo.openingHours}</span></p>
                    </div>
                    <div className="mt-6">
                        <LocationMap />
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold font-heading text-expert-blue mb-6">Formulaire de contact</h2>
                    {submitted ? (
                        <div className="bg-green-100 border-l-4 border-expert-green text-green-700 p-4" role="alert">
                            <p className="font-bold">Message envoyé !</p>
                            <p>Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="name" placeholder="Votre nom" required className="w-full p-3 border rounded" onChange={handleChange}/>
                            <input name="email" type="email" placeholder="Votre email" required className="w-full p-3 border rounded" onChange={handleChange}/>
                            <input name="subject" placeholder="Sujet" required className="w-full p-3 border rounded" onChange={handleChange}/>
                            <textarea name="message" placeholder="Votre message" rows={5} required className="w-full p-3 border rounded" onChange={handleChange}></textarea>
                            <button type="submit" disabled={isLoading} className="w-full bg-expert-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 disabled:bg-gray-400">
                                {isLoading ? "Envoi en cours..." : "Envoyer le message"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
