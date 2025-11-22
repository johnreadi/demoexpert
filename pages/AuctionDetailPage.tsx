

import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import type { Auction as AuctionType } from '../types';
import * as api from '../api';
import CountdownTimer from '../components/CountdownTimer';
import { useAuth } from '../context/AuthContext';

// Helper to process auction data from API, converting date strings to Date objects
const processAuctionData = (auctionData: AuctionType): AuctionType => {
    return {
        ...auctionData,
        endDate: typeof auctionData.endDate === 'string' ? new Date(auctionData.endDate) : auctionData.endDate,
        bids: auctionData.bids.map(bid => ({
            ...bid,
            timestamp: typeof bid.timestamp === 'string' ? new Date(bid.timestamp) : bid.timestamp
        }))
    };
};

export default function AuctionDetailPage(): React.ReactNode {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();
    const [auction, setAuction] = useState<AuctionType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mainImage, setMainImage] = useState<string>('');
    const [bidAmount, setBidAmount] = useState<string>('');
    const [isBidding, setIsBidding] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [isEnded, setIsEnded] = useState(false);

    useEffect(() => {
        const fetchAuction = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const foundAuction = await api.getAuctionById(id);
                if(foundAuction) {
                    const processedAuction = processAuctionData(foundAuction);
                    setAuction(processedAuction);
                    setMainImage(processedAuction.vehicle?.images?.[0] || 'https://picsum.photos/seed/auction-detail/800/600');
                    if (processedAuction.endDate < new Date()) {
                        setIsEnded(true);
                    }
                } else {
                    setAuction(null);
                }
            } catch (err) {
                console.error("Failed to fetch auction", err);
                setAuction(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAuction();
    }, [id]);
    
    const handleBidSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auction || isEnded || isBidding || !user) return;

        const newBid = parseFloat(bidAmount);
        if (isNaN(newBid) || newBid <= auction.currentBid) {
            setError(`Votre offre doit être supérieure à ${auction.currentBid.toLocaleString()} €.`);
            setSuccess('');
            return;
        }
        
        setIsBidding(true);
        setError('');
        setSuccess('');

        try {
            const updatedAuctionFromApi = await api.addBid(auction.id, newBid, user.id, user.name);
            const processedAuction = processAuctionData(updatedAuctionFromApi);
            setAuction(processedAuction);
            setSuccess(`Félicitations ! Votre offre de ${newBid.toLocaleString()} € est la plus haute.`);
            setBidAmount('');
        } catch(err: any) {
            setError(err.message || "Une erreur est survenue lors de l'envoi de l'offre.");
        } finally {
            setIsBidding(false);
        }
    };

    const renderBiddingArea = () => {
      if (isEnded) {
        return (
          <div className="p-4 bg-red-100 text-red-800 rounded-lg text-center font-bold">
            Cette vente est terminée.
          </div>
        );
      }
      if (!isAuthenticated) {
        return (
          <div className="p-4 bg-blue-100 text-expert-blue rounded-lg text-center">
            <h3 className="font-bold">Vous devez être connecté pour faire une offre.</h3>
            <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/connexion" state={{ from: location }} className="bg-expert-blue hover:bg-expert-blue/90 text-white font-bold py-2 px-4 rounded transition duration-300">
                Se connecter
              </Link>
              <Link to="/inscription" className="bg-expert-green hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                Créer un compte
              </Link>
            </div>
          </div>
        );
      }
      if (user?.status === 'pending') {
         return (
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg text-center font-bold">
            Votre compte est en attente d'approbation par un administrateur avant de pouvoir faire une offre.
          </div>
        );
      }
      return (
        <form onSubmit={handleBidSubmit}>
          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">Votre offre (€)</label>
          <div className="flex">
            <input 
              type="number" 
              name="bidAmount"
              id="bidAmount"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`> ${auction?.currentBid} €`}
              className="w-full p-3 border-gray-300 rounded-l-md shadow-sm focus:ring-expert-blue focus:border-expert-blue text-lg"
              required 
              disabled={isBidding}
            />
            <button type="submit" className="bg-expert-green text-white font-bold px-6 rounded-r-md hover:bg-green-600 transition-colors disabled:bg-gray-400" disabled={isBidding}>
              {isBidding ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
        </form>
      );
    };

    if (isLoading) {
        return <div className="text-center py-20">Chargement de l'offre...</div>;
    }

    if (!auction) {
        return <div className="text-center py-20">Offre non trouvée.</div>;
    }

    return (
        <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Image Gallery & Description (col-span-2) */}
                    <div className="lg:col-span-2">
                        <h1 className="text-3xl md:text-4xl font-bold font-heading text-expert-blue mb-2">{auction.vehicle?.name || 'Véhicule'}</h1>
                        <p className="text-lg text-gray-500 mb-6">{auction.vehicle?.brand || ''} {auction.vehicle?.model || ''} ({auction.vehicle?.year ?? ''})</p>
                        
                        <img src={mainImage} alt={auction.vehicle?.name || 'Véhicule'} className="w-full h-96 object-cover rounded-lg shadow-md mb-4" />
                        <div className="flex space-x-2">
                            {Array.isArray(auction.vehicle?.images) && auction.vehicle!.images!.map((img, index) => (
                                <img 
                                    key={index}
                                    src={img} 
                                    alt={`${auction.vehicle?.name || 'Véhicule'} thumbnail ${index + 1}`}
                                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${mainImage === img ? 'border-expert-blue' : 'border-transparent'}`}
                                    onClick={() => setMainImage(img)}
                                />
                            ))}
                        </div>
                        
                        <div className="mt-8">
                            <h3 className="text-2xl font-bold font-heading text-expert-blue border-b-2 border-expert-light-gray pb-2 mb-4">Détails du Véhicule</h3>
                            <div className="grid grid-cols-2 gap-4 text-lg">
                                <p><strong className="font-semibold">Kilométrage:</strong> {Number(auction.vehicle?.mileage ?? 0).toLocaleString()} km</p>
                                <p><strong className="font-semibold">Année:</strong> {auction.vehicle?.year ?? ''}</p>
                                <p><strong className="font-semibold">Marque:</strong> {auction.vehicle?.brand || ''}</p>
                                <p><strong className="font-semibold">Modèle:</strong> {auction.vehicle?.model || ''}</p>
                            </div>
                            <p className="mt-4 text-gray-700">{auction.vehicle.description}</p>
                        </div>
                    </div>

                    {/* Bidding Box (col-span-1) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-expert-light-gray p-6 rounded-lg shadow-inner">
                            <h2 className="text-xl font-bold font-heading text-center text-expert-blue mb-4">Temps Restant</h2>
                            <div className="flex justify-center mb-6">
                                <CountdownTimer endDate={auction.endDate} onEnd={() => setIsEnded(true)} />
                            </div>

                            <div className="text-center mb-6">
                                <p className="text-gray-600">Offre Actuelle</p>
                                <p className="text-5xl font-bold text-expert-green my-2">{auction.currentBid.toLocaleString()} €</p>
                                <p className="text-sm text-gray-500">({auction.bidCount} offres)</p>
                            </div>
                            
                            {renderBiddingArea()}

                             <div className="mt-6 text-xs text-gray-500 text-center">
                                <p><i className="fas fa-shield-alt mr-1"></i>Toutes les offres sont définitives.</p>
                                <p>Le meilleur offrant sera contacté après la fin de la vente.</p>
                             </div>
                        </div>
                    </div>
                </div>
                {/* Bid History */}
                <div className="mt-12">
                     <h3 className="text-2xl font-bold font-heading text-expert-blue border-b-2 border-expert-light-gray pb-2 mb-4">Historique des Offres</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3">Participant</th>
                                    <th className="p-3">Montant</th>
                                    <th className="p-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auction.bids.slice().sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map((bid, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-3">{bid.userId === user?.id ? `Vous (${bid.bidderName})` : bid.bidderName}</td>
                                        <td className="p-3 font-bold">{bid.amount.toLocaleString()} €</td>
                                        <td className="p-3 text-sm text-gray-600">{bid.timestamp.toLocaleString('fr-FR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            </div>
        </div>
    );
}
