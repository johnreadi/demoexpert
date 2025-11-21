import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import type { AdminMessage } from '../types';

type AccountTab = 'profile' | 'bids' | 'requests';

type UserBid = {
    auctionId: string;
    vehicleName: string;
    isWinning: boolean;
    userHighestBid: number;
    currentHighestBid: number;
    endDate: Date;
    status: 'active' | 'terminated';
};

const TabButton: React.FC<{ activeTab: AccountTab, tabName: AccountTab, onClick: (tab: AccountTab) => void, children: React.ReactNode, icon: string }> = ({ activeTab, tabName, onClick, children, icon }) => (
    <button
        onClick={() => onClick(tabName)}
        className={`flex-1 text-center p-4 font-bold border-b-4 transition-colors duration-300 flex items-center justify-center gap-2 ${activeTab === tabName ? 'border-expert-green text-expert-blue' : 'border-transparent text-expert-gray hover:text-expert-blue'}`}
    >
        <i className={`fas ${icon}`}></i>
        <span>{children}</span>
    </button>
);

export default function AccountPage(): React.ReactNode {
    const { user, updateUser: updateAuthUser } = useAuth();
    const [activeTab, setActiveTab] = useState<AccountTab>('profile');
    const [isLoading, setIsLoading] = useState(true);

    const [bids, setBids] = useState<UserBid[]>([]);
    const [requests, setRequests] = useState<AdminMessage[]>([]);

    const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '' });
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const [userBids, userRequests] = await Promise.all([
                    api.getBidsForUser(user.id),
                    api.getMessagesForUser(user.email)
                ]);
                setBids(userBids);
                setRequests(userRequests);
            } catch (error) {
                console.error("Failed to load account data:", error);
                setProfileMessage({ type: 'error', text: "Erreur lors du chargement de vos données." });
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [user]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setProfileMessage({ type: '', text: '' });
        try {
            const updatedUser = await api.updateUserProfile(user.id, profileData);
            updateAuthUser(updatedUser); // Update user in auth context
            setProfileMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
        } catch (error: any) {
            setProfileMessage({ type: 'error', text: error.message || 'Une erreur est survenue.' });
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setPasswordMessage({ type: '', text: '' });
        if (passwordData.new !== passwordData.confirm) {
            setPasswordMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
            return;
        }
        try {
            await api.updateUserPassword(user.id, { current: passwordData.current, new: passwordData.new });
            setPasswordMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès !' });
            setPasswordData({ current: '', new: '', confirm: '' }); // Reset form
        } catch (error: any) {
            setPasswordMessage({ type: 'error', text: error.message || 'Une erreur est survenue.' });
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-8">Chargement de vos informations...</div>;
        }

        switch (activeTab) {
            case 'profile':
                return (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Profile Form */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold font-heading text-expert-blue mb-4">Informations Personnelles</h3>
                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium">Nom complet</label>
                                    <input id="name" type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="mt-1 w-full p-2 border rounded" required />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium">Email</label>
                                    <input id="email" type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="mt-1 w-full p-2 border rounded" required />
                                </div>
                                <button type="submit" className="bg-expert-blue text-white font-bold py-2 px-4 rounded hover:bg-expert-blue/90">Mettre à jour</button>
                                {profileMessage.text && <p className={`mt-2 text-sm ${profileMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{profileMessage.text}</p>}
                            </form>
                        </div>
                        {/* Password Form */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                             <h3 className="text-xl font-bold font-heading text-expert-blue mb-4">Changer de Mot de Passe</h3>
                             <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="current" className="block text-sm font-medium">Mot de passe actuel</label>
                                    <input id="current" type="password" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} className="mt-1 w-full p-2 border rounded" required />
                                </div>
                                <div>
                                    <label htmlFor="new" className="block text-sm font-medium">Nouveau mot de passe</label>
                                    <input id="new" type="password" value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})} className="mt-1 w-full p-2 border rounded" required />
                                </div>
                                <div>
                                    <label htmlFor="confirm" className="block text-sm font-medium">Confirmer le nouveau mot de passe</label>
                                    <input id="confirm" type="password" value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} className="mt-1 w-full p-2 border rounded" required />
                                </div>
                                <button type="submit" className="bg-expert-blue text-white font-bold py-2 px-4 rounded hover:bg-expert-blue/90">Changer</button>
                                 {passwordMessage.text && <p className={`mt-2 text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{passwordMessage.text}</p>}
                            </form>
                        </div>
                    </div>
                );
            case 'bids':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold font-heading text-expert-blue mb-4">Mes Offres</h3>
                        {bids.length === 0 ? (
                            <p>Vous n'avez encore participé à aucune offre.</p>
                        ) : (
                            <div className="space-y-4">
                                {bids.map(bid => (
                                    <div key={bid.auctionId} className="border p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <Link to={`/offres/${bid.auctionId}`} className="font-bold text-expert-blue hover:underline">{bid.vehicleName}</Link>
                                            <p className="text-sm">Votre meilleure offre : <span className="font-semibold">{bid.userHighestBid.toLocaleString()} €</span></p>
                                            <p className="text-sm">Offre la plus haute : <span className="font-semibold">{bid.currentHighestBid.toLocaleString()} €</span></p>
                                        </div>
                                        <div className="text-center">
                                            {bid.status === 'active' ? (
                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${bid.isWinning ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {bid.isWinning ? 'Gagnant' : 'Surpassé'}
                                                </span>
                                            ) : (
                                                 <span className={`px-3 py-1 text-sm font-semibold rounded-full ${bid.isWinning ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                                    {bid.isWinning ? 'Remporté' : 'Perdu'}
                                                </span>
                                            )}
                                            <p className="text-xs mt-1">Termine le {new Date(bid.endDate).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'requests':
                 return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold font-heading text-expert-blue mb-4">Mes Demandes</h3>
                         {requests.length === 0 ? (
                            <p>Vous n'avez encore soumis aucune demande.</p>
                        ) : (
                            <div className="space-y-4">
                               {requests.map(req => (
                                   <div key={req.id} className="border p-4 rounded-lg">
                                       <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold">{req.subject}</p>
                                                <p className="text-sm text-gray-500">De : {req.from} - Le {new Date(req.receivedAt).toLocaleDateString('fr-FR')}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${req.status === 'replied' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {req.status === 'replied' ? 'Répondu' : 'En attente'}
                                            </span>
                                       </div>
                                       <p className="mt-2 text-gray-700 bg-gray-50 p-3 rounded italic">"{req.content.substring(0, 150)}..."</p>
                                   </div>
                               ))}
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-heading text-expert-blue">Mon Espace Personnel</h1>
                <p className="text-lg">Gérez vos informations, suivez vos offres et vos demandes.</p>
            </header>
            
            <div className="bg-white rounded-lg shadow-md">
                <nav className="flex border-b">
                    <TabButton activeTab={activeTab} tabName="profile" onClick={setActiveTab} icon="fa-user-edit">
                        Mon Profil
                    </TabButton>
                    <TabButton activeTab={activeTab} tabName="bids" onClick={setActiveTab} icon="fa-gavel">
                        Mes Offres
                    </TabButton>
                    <TabButton activeTab={activeTab} tabName="requests" onClick={setActiveTab} icon="fa-envelope-open-text">
                        Mes Demandes
                    </TabButton>
                </nav>
                <div className="p-6 bg-expert-light-gray rounded-b-lg">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}