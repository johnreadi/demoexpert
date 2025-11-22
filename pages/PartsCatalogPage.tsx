import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product, PartCategory } from '../types';
import * as api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group">
        <div className="relative">
            <img src={product.images?.[0] || 'https://picsum.photos/seed/product-card/800/600'} alt={product.name} className="w-full h-48 object-cover" />
            <div className="absolute top-2 right-2 bg-expert-blue text-white text-xs font-bold px-2 py-1 rounded">{product.category}</div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-expert-blue group-hover:text-expert-green transition-colors">{product.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{product.brand} {product.model} ({product.year})</p>
            <p className="text-sm">Réf: {product.oemRef}</p>
            <div className="mt-auto pt-4">
                 <Link to={`/pieces/${product.id}`} className="w-full text-center bg-expert-green hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                    Détails & Devis
                 </Link>
            </div>
        </div>
    </div>
);

export default function PartsCatalogPage(): React.ReactNode {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        model: ''
    });

     useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const products = await api.getProducts({});
                setAllProducts(products);
                setFilteredProducts(products);
            } catch (err) {
                setError("Impossible de charger le catalogue de pièces. Veuillez réessayer.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);
    
    useEffect(() => {
        const applyFilters = () => {
            const result = allProducts.filter(p =>
                (filters.category ? p.category === filters.category : true) &&
                (filters.brand ? p.brand.toLowerCase().includes(filters.brand.toLowerCase()) : true) &&
                (filters.model ? p.model.toLowerCase().includes(filters.model.toLowerCase()) : true)
            );
            setFilteredProducts(result);
        };
        applyFilters();
    }, [filters, allProducts]);


    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8 animate-fade-in-down">
                <h1 className="text-4xl font-bold font-heading text-expert-blue">Catalogue de Pièces</h1>
                <p className="text-lg">Trouvez la pièce parfaite pour votre véhicule parmi notre large sélection.</p>
            </header>

            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                        <h3 className="text-xl font-bold font-heading text-expert-blue mb-4">Filtres</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marque</label>
                                <input type="text" name="brand" id="brand" value={filters.brand} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-expert-blue focus:border-expert-blue"/>
                            </div>
                            <div>
                                <label htmlFor="model" className="block text-sm font-medium text-gray-700">Modèle</label>
                                <input type="text" name="model" id="model" value={filters.model} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-expert-blue focus:border-expert-blue"/>
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Catégorie</label>
                                <select name="category" id="category" value={filters.category} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-expert-blue focus:border-expert-blue">
                                    <option value="">Toutes</option>
                                    {Object.values(PartCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="flex-1">
                    {isLoading ? (
                         <LoadingSpinner message="Chargement des pièces..." />
                    ) : error ? (
                        <ErrorMessage message={error} />
                    ) : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => <ProductCard key={product.id} product={product} />)
                            ) : (
                                <p className="col-span-full text-center py-10">Aucun produit ne correspond à votre recherche.</p>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
