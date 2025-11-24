import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import { useSettings } from '../context/SettingsContext';

export default function LiftRentalPage(): React.ReactNode {
    const { settings } = useSettings();
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const pricingTiers = settings?.liftRental?.pricingTiers || [];
    const unavailableDates = settings?.liftRental?.unavailableDates || [];

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        date: '',
        time: '09:00',
        duration: pricingTiers.length > 0 ? pricingTiers[0].duration : 0,
    });
    
    const [totalPrice, setTotalPrice] = useState(0);
    const [dateError, setDateError] = useState('');

    useEffect(() => {
        if (pricingTiers.length > 0 && formData.duration === 0) {
            setFormData(prev => ({...prev, duration: pricingTiers[0].duration}));
        }
    }, [pricingTiers, formData.duration]);

    useEffect(() => {
        const selectedTier = pricingTiers.find(tier => tier.duration === formData.duration);
        setTotalPrice(selectedTier ? selectedTier.price : 0);
    }, [formData.duration, pricingTiers]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'date') {
            if (unavailableDates.includes(value)) {
                setDateError("Cette date n'est pas disponible. Veuillez en choisir une autre.");
                setFormData(prev => ({ ...prev, date: '' })); // Reset the date field
                return;
            } else {
                setDateError(''); // Clear error on valid date
            }
        }

        const parsedValue = name === 'duration' ? parseInt(value, 10) : value;
        setFormData({ ...formData, [name]: parsedValue });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (dateError) return; // Prevent submission if there's a date error
        setIsLoading(true);
        try {
            await api.submitLiftRentalRequest({ ...formData, price: totalPrice });
            setSubmitted(true);
        } catch (error) {
            console.error("Failed to submit lift rental request", error);
            alert("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const timeSlots = Array.from({ length: 9 }, (_, i) => {
        const hour = 9 + i;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    if (submitted) {
        return (
            <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl text-center">
                    <h1 className="text-3xl font-bold font-heading text-expert-green mb-4">Réservation Envoyée !</h1>
                    <p className="mb-6">Merci, {formData.name}. Votre demande de location a bien été reçue. Nous vous contacterons rapidement pour confirmer votre créneau.</p>
                    <Link to="/" className="bg-expert-blue hover:bg-expert-blue/80 text-white font-bold py-2 px-4 rounded transition duration-300">
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="relative bg-expert-blue text-white overflow-hidden">
                <div className="absolute inset-0">
                    <img src="https://picsum.photos/seed/lift-rental/1920/1080" alt="Pont élévateur dans un garage" className="w-full h-full object-cover opacity-30" />
                </div>
                <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">Location de Pont Élévateur</h1>
                    <p className="text-lg md:text-2xl">Travaillez sur votre véhicule comme un pro dans notre atelier.</p>
                </div>
            </div>

            <div className="w-full mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div>
                        <h2 className="text-3xl font-bold font-heading text-expert-blue mb-6">Un espace pour vos réparations</h2>
                        <p className="text-lg mb-6">Vous êtes un mécanicien amateur ou passionné ? Louez l'un de nos ponts élévateurs et profitez d'un espace de travail sécurisé et professionnel pour effectuer l'entretien ou les réparations de votre véhicule.</p>
                        <ul className="space-y-4 text-lg">
                            <li className="flex items-start"><i className="fas fa-check-circle text-expert-green mr-3 mt-1"></i><span>Pont élévateur 2 colonnes (jusqu'à 3.5 tonnes)</span></li>
                            <li className="flex items-start"><i className="fas fa-check-circle text-expert-green mr-3 mt-1"></i><span>Environnement propre, éclairé et sécurisé</span></li>
                            <li className="flex items-start"><i className="fas fa-check-circle text-expert-green mr-3 mt-1"></i><span>Accès à l'outillage de base (en option)</span></li>
                            <li className="flex items-start"><i className="fas fa-check-circle text-expert-green mr-3 mt-1"></i><span>Conseils de nos experts sur place si besoin</span></li>
                        </ul>
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-xl sticky top-24">
                        <h2 className="text-2xl font-bold font-heading text-center text-expert-blue mb-6">Réserver un créneau</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="name" placeholder="Nom complet" onChange={handleChange} required className="w-full p-3 border rounded focus:ring-expert-blue focus:border-expert-blue" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="phone" type="tel" placeholder="Téléphone" onChange={handleChange} required className="w-full p-3 border rounded focus:ring-expert-blue focus:border-expert-blue" />
                                <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full p-3 border rounded focus:ring-expert-blue focus:border-expert-blue" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                                    <input 
                                        id="date" 
                                        name="date" 
                                        type="date" 
                                        value={formData.date}
                                        onChange={handleChange} 
                                        required 
                                        className={`w-full p-3 border rounded bg-white focus:ring-expert-blue focus:border-expert-blue ${dateError ? 'border-red-500' : 'border-gray-300'}`} 
                                        min={new Date().toISOString().split("T")[0]} 
                                    />
                                    {dateError && <p className="text-red-500 text-sm mt-1">{dateError}</p>}
                                </div>
                                <div>
                                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">Heure de début</label>
                                    <select id="time" name="time" value={formData.time} onChange={handleChange} required className="w-full p-3 border rounded bg-white focus:ring-expert-blue focus:border-expert-blue">
                                        {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Durée</label>
                                <select id="duration" name="duration" value={formData.duration} onChange={handleChange} required className="w-full p-3 border rounded bg-white focus:ring-expert-blue focus:border-expert-blue">
                                    {pricingTiers.length > 0 ? (
                                        pricingTiers.map(tier => (
                                            <option key={tier.duration} value={tier.duration}>
                                                {tier.duration} Heure{tier.duration > 1 ? 's' : ''}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Aucun créneau disponible</option>
                                    )}
                                </select>
                            </div>
                            <div className="mt-6 p-4 bg-expert-light-gray rounded-lg text-center">
                                <p className="text-lg">Prix total estimé :</p>
                                <p className="text-3xl font-bold font-heading text-expert-green">{totalPrice} €</p>
                            </div>
                            <button type="submit" disabled={isLoading || pricingTiers.length === 0} className="w-full bg-expert-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 disabled:bg-gray-400">
                                {isLoading ? 'Envoi en cours...' : 'Envoyer ma demande'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "Quels sont les tarifs de location ?", "acceptedAnswer": { "@type": "Answer", "text": "Les tarifs dépendent de la durée. Consultez les paliers affichés et réservez en ligne." } },
              { "@type": "Question", "name": "Quelles sont les conditions d'utilisation ?", "acceptedAnswer": { "@type": "Answer", "text": "Respect des consignes de sécurité, véhicule conforme et ponctualité aux créneaux réservés." } },
              { "@type": "Question", "name": "Proposez-vous de l'outillage ?", "acceptedAnswer": { "@type": "Answer", "text": "Un outillage de base peut être proposé en option selon disponibilité." } }
            ]
          }) }} />
        </div>
    );
}