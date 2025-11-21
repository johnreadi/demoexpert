import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';

export default function ScrapRemovalPage(): React.ReactNode {
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        vehicle: '',
        immatriculation: '',
        date: '',
        commentaire: '',
    });
    const [files, setFiles] = useState<{
        imageAvant: File | null;
        imageArriere: File | null;
        imageTableauBord: File | null;
    }>({
        imageAvant: null,
        imageArriere: null,
        imageTableauBord: null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && e.target.name in files) {
            const fileKey = e.target.name as keyof typeof files;
            setFiles({ ...files, [fileKey]: e.target.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // In a real app, this would use FormData to send files
            const submissionData = { ...formData, ...files };
            await api.submitScrapRemovalRequest(submissionData);
            setSubmitted(true);
        } catch(error) {
            console.error("Failed to submit scrap removal request", error);
            alert("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl text-center">
                    <h1 className="text-3xl font-bold font-heading text-expert-green mb-4">Demande Reçue !</h1>
                    <p className="mb-6">Merci, {formData.name}. Votre demande d'enlèvement d'épave a bien été prise en compte. Notre équipe vous contactera dans les plus brefs délais pour planifier le rendez-vous.</p>
                    <Link to="/" className="bg-expert-blue hover:bg-expert-blue/80 text-white font-bold py-2 px-4 rounded transition duration-300">
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }
    
    const FileInput = ({ name, label, file }: { name: keyof typeof files; label: string; file: File | null }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-1">
                <input 
                    id={name} 
                    name={name} 
                    type="file" 
                    onChange={handleFileChange} 
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-expert-blue/10 file:text-expert-blue hover:file:bg-expert-blue/20"
                    accept="image/*"
                />
                 {file && <p className="mt-1 text-xs text-green-600 font-semibold">{file.name} sélectionné.</p>}
            </div>
        </div>
    );

    return (
        <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-start">
                <div>
                    <h1 className="text-4xl font-bold font-heading text-expert-blue">Enlèvement d'Épave Gratuit</h1>
                    <p className="text-lg mt-4 mb-6">Débarrassez-vous de votre véhicule hors d'usage (VHU) en toute simplicité. Notre service est rapide, gratuit et respectueux de l'environnement.</p>
                    <ul className="space-y-3 text-lg">
                        <li className="flex items-center"><i className="fas fa-check-circle text-expert-green mr-3"></i>Intervention gratuite en Normandie</li>
                        <li className="flex items-center"><i className="fas fa-check-circle text-expert-green mr-3"></i>Prise de rendez-vous rapide</li>
                        <li className="flex items-center"><i className="fas fa-check-circle text-expert-green mr-3"></i>Formalités administratives simplifiées</li>
                        <li className="flex items-center"><i className="fas fa-check-circle text-expert-green mr-3"></i>Certificat de destruction fourni</li>
                    </ul>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-xl">
                    <h2 className="text-2xl font-bold font-heading text-center text-expert-blue mb-6">Planifier un enlèvement</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input name="name" value={formData.name} placeholder="Nom complet" onChange={handleChange} required className="w-full p-3 border rounded"/>
                        <input name="phone" value={formData.phone} type="tel" placeholder="Téléphone" onChange={handleChange} required className="w-full p-3 border rounded"/>
                        <input name="email" value={formData.email} type="email" placeholder="Email" onChange={handleChange} required className="w-full p-3 border rounded"/>
                        <input name="address" value={formData.address} placeholder="Adresse d'enlèvement" onChange={handleChange} required className="w-full p-3 border rounded"/>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="vehicle" value={formData.vehicle} placeholder="Véhicule (ex: Renault Clio 2)" onChange={handleChange} required className="w-full p-3 border rounded"/>
                            <input name="immatriculation" value={formData.immatriculation} placeholder="Immatriculation" onChange={handleChange} required className="w-full p-3 border rounded"/>
                        </div>

                        <input name="date" value={formData.date} type="text" onFocus={(e) => (e.target.type = 'date')} onBlur={(e) => (e.target.type = 'text')} placeholder="Date de disponibilité souhaitée" onChange={handleChange} className="w-full p-3 border rounded"/>
                        
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-lg font-medium text-gray-900">Photos du véhicule</h3>
                            <p className="text-sm text-gray-500">Aide-nous à préparer l'intervention en joignant quelques photos.</p>
                            <FileInput name="imageAvant" label="Avant du véhicule" file={files.imageAvant} />
                            <FileInput name="imageArriere" label="Arrière du véhicule" file={files.imageArriere} />
                            <FileInput name="imageTableauBord" label="Tableau de bord" file={files.imageTableauBord} />
                        </div>
                        
                        <textarea name="commentaire" value={formData.commentaire} placeholder="Commentaire (ex: état des pneus, batterie HS...)" rows={3} onChange={handleChange} className="w-full p-3 border rounded"></textarea>
                        
                        <button type="submit" disabled={isLoading} className="w-full bg-expert-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 disabled:bg-gray-400">
                            {isLoading ? 'Envoi en cours...' : 'Envoyer ma demande'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
