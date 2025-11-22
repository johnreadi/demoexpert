import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Auction } from '../types';
import CountdownTimer from '../components/CountdownTimer';
import * as api from '../api';

const AuctionCard: React.FC<{ auction: Auction }> = ({ auction }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transition-transform duration-300 hover:-translate-y-2">
            <div className="relative">
                <img src={auction.vehicle.images?.[0] || 'https://picsum.photos/seed/auction-card/800/600'} alt={auction.vehicle.name} className="w-full h-56 object-cover" />
                <div className="absolute top-0 right-0 bg-expert-blue text-white px-3 py-1 text-sm font-bold rounded-bl-lg">
                    <i className="fas fa-tags mr-2"></i>{auction.bidCount} offres
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-bold font-heading text-expert-blue group-hover:text-expert-green transition-colors">{auction.vehicle.name}</h3>
                <p className="text-sm text-gray-500">{auction.vehicle.model} - {auction.vehicle.year}</p>
                <p className="text-sm text-gray-500 mb-3">{auction.vehicle.mileage.toLocaleString()} km</p>
                
                <div className="my-3">
                    <div className="text-sm text-gray-600">Offre actuelle</div>
                    <div className="text-3xl font-bold text-expert-green">{auction.currentBid.toLocaleString()} €</div>
                </div>

                <div className="my-3">
                     <CountdownTimer endDate={typeof auction.endDate === 'string' ? new Date(auction.endDate) : auction.endDate} />
                </div>
                
                <div className="mt-auto pt-4">
                     <Link to={`/offres/${auction.id}`} className="w-full text-center bg-expert-green hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 block">
                        Faire une offre
                     </Link>
                </div>
            </div>
        </div>
    );
};


export default function AuctionsPage(): React.ReactNode {
    const [allAuctions, setAllAuctions] = useState<Auction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'active', // 'active' or 'terminated'
        sortBy: 'endingSoon', // 'endingSoon' or 'oldest'
        brand: ''
    });

    useEffect(() => {
        const fetchAuctions = async () => {
            setIsLoading(true);
            try {
                const data = await api.getAuctions();
                // Ensure dates are Date objects for proper comparison
                const processedData = data.map(auction => ({
                    ...auction,
                    endDate: typeof auction.endDate === 'string' ? new Date(auction.endDate) : auction.endDate,
                }));
                setAllAuctions(processedData);
            } catch (error) {
                console.error("Failed to fetch auctions", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAuctions();
    }, []);

    const filteredAuctions = useMemo(() => {
        let auctions = [...allAuctions];

        // 1. Filter by status
        const now = new Date();
        if (filters.status === 'active') {
            auctions = auctions.filter(a => a.endDate > now);
        } else if (filters.status === 'terminated') {
            auctions = auctions.filter(a => a.endDate <= now);
        }

        // 2. Filter by brand
        if (filters.brand) {
            auctions = auctions.filter(a => 
                a.vehicle.brand.toLowerCase().includes(filters.brand.toLowerCase())
            );
        }

        // 3. Sort
        auctions.sort((a, b) => {
            if (filters.sortBy === 'endingSoon') {
                return a.endDate.getTime() - b.endDate.getTime();
            }
            if (filters.sortBy === 'oldest') {
                return b.endDate.getTime() - a.endDate.getTime();
            }
            return 0;
        });

        return auctions;
    }, [allAuctions, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold font-heading text-expert-blue">Nos Offres de Véhicules</h1>
                <p className="text-lg mt-2">Faites votre meilleure offre ! Des véhicules d'occasion au meilleur prix.</p>
            </header>

            {/* Filter Section */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Statut</label>
                        <select
                            id="status"
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-expert-blue focus:border-expert-blue bg-white"
                        >
                            <option value="active">Actives</option>
                            <option value="terminated">Terminées</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">Trier par</label>
                        <select
                            id="sortBy"
                            name="sortBy"
                            value={filters.sortBy}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-expert-blue focus:border-expert-blue bg-white"
                        >
                            <option value="endingSoon">Finissant bientôt</option>
                            <option value="oldest">Les plus anciennes</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marque du véhicule</label>
                        <input
                            type="text"
                            id="brand"
                            name="brand"
                            value={filters.brand}
                            onChange={handleFilterChange}
                            placeholder="Ex: Renault, Peugeot..."
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-expert-blue focus:border-expert-blue"
                        />
                    </div>
                </div>
            </div>

            <main>
                 {isLoading ? (
                    <div className="text-center">Chargement des offres...</div>
                ) : (
                    <>
                        {filteredAuctions.length > 0 ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredAuctions.map(auction => (
                                    <AuctionCard key={auction.id} auction={auction} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center bg-white p-8 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold text-expert-blue">Aucune offre trouvée</h3>
                                <p className="mt-2 text-gray-600">Aucune offre ne correspond à vos critères de recherche. Essayez de modifier vos filtres.</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
