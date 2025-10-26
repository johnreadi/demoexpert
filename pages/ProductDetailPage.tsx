import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import * as api from '../api';
import { useSettings } from '../context/SettingsContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useToast } from '../context/ToastContext';

const QuoteRequestModal: React.FC<{
    product: Product;
    onClose: () => void;
}> = ({ product, onClose }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.submitQuoteRequest(product, formData);
            showToast("Demande de devis envoyée avec succès !", "success");
            onClose();
        } catch (error) {
            showToast("Erreur lors de l'envoi de la demande.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">
                    <i className="fas fa-times"></i>
                </button>
                <h2 className="text-2xl font-bold font-heading text-expert-blue mb-2">Demande de devis</h2>
                <p className="mb-6 text-gray-600">Pour : <span className="font-semibold">{product.name}</span></p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" placeholder="Nom complet" required className="w-full p-3 border rounded" value={formData.name} onChange={handleChange} />
                    <input name="email" type="email" placeholder="Votre email" required className="w-full p-3 border rounded" value={formData.email} onChange={handleChange} />
                    <input name="phone" type="tel" placeholder="Votre téléphone (optionnel)" className="w-full p-3 border rounded" value={formData.phone} onChange={handleChange} />
                    <textarea name="message" placeholder="Votre message (optionnel)" rows={3} className="w-full p-3 border rounded" value={formData.message} onChange={handleChange}></textarea>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-expert-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 disabled:bg-gray-400">
                        {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function ProductDetailPage(): React.ReactNode {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mainImage, setMainImage] = useState<string>('');
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const { settings } = useSettings();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setIsLoading(true);
            setError(null);
            try {
                const foundProduct = await api.getProductById(id);
                if (foundProduct) {
                    setProduct(foundProduct);
                    setMainImage(foundProduct.images[0]);
                    
                    const related = await api.getProducts({ category: foundProduct.category, limit: 4 });
                    setSimilarProducts(related.filter(p => p.id !== foundProduct.id).slice(0, 3));
                } else {
                    setError("Le produit demandé n'a pas été trouvé.");
                }
            } catch (err) {
                setError("Une erreur est survenue lors de la récupération du produit.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (isLoading || !settings) {
        return <LoadingSpinner message="Chargement du produit..." />;
    }

    if (error || !product) {
        return <ErrorMessage message={error || "Produit non disponible."} />;
    }

    return (
        <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
            {isQuoteModalOpen && product && (
                <QuoteRequestModal 
                    product={product} 
                    onClose={() => setIsQuoteModalOpen(false)}
                />
            )}
            <div className="bg-white p-8 rounded-lg shadow-xl">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div>
                        <img src={mainImage} alt={product.name} className="w-full h-96 object-cover rounded-lg shadow-md mb-4" />
                        <div className="flex space-x-2">
                            {product.images.map((img, index) => (
                                <img 
                                    key={index}
                                    src={img} 
                                    alt={`${product.name} thumbnail ${index + 1}`}
                                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${mainImage === img ? 'border-expert-blue' : 'border-transparent'}`}
                                    onClick={() => setMainImage(img)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold font-heading text-expert-blue mb-2">{product.name}</h1>
                        <p className="text-lg text-gray-500 mb-4">{product.brand} {product.model} ({product.year})</p>
                        
                        <div className="space-y-4 text-lg">
                            <p><span className="font-semibold">Référence OEM:</span> {product.oemRef}</p>
                            <p><span className="font-semibold">État:</span> <span className="bg-green-100 text-expert-green px-2 py-1 rounded-full text-sm font-bold">{product.condition}</span></p>
                            <p><span className="font-semibold">Garantie:</span> {product.warranty}</p>
                            <p><span className="font-semibold">Compatibilité:</span> {product.compatibility}</p>
                        </div>

                        <div className="mt-6 border-t pt-6">
                             <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                        </div>
                        
                        <div className="mt-6">
                            <button onClick={() => setIsQuoteModalOpen(true)} className="w-full bg-expert-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300">
                                <i className="fas fa-file-invoice-dollar mr-2"></i> Demander un Devis
                            </button>
                            <p className="text-center text-sm mt-4">Pour une réponse immédiate, appelez-nous au <a href={`tel:${settings.businessInfo.phone.replace(/\s/g, '')}`} className="font-bold text-expert-blue hover:underline">{settings.businessInfo.phone}</a>.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-3xl font-bold font-heading text-center mb-8 text-expert-blue">Produits Similaires</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {similarProducts.map(p => (
                            <div key={p.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
                                <img src={p.images[0]} alt={p.name} className="w-full h-48 object-cover"/>
                                <div className="p-4">
                                    <h4 className="font-bold text-lg text-expert-blue truncate">{p.name}</h4>
                                    <p className="text-sm text-gray-500">{p.brand} {p.model}</p>
                                    <Link to={`/pieces/${p.id}`} className="mt-4 inline-block bg-expert-blue text-white py-2 px-4 rounded hover:bg-expert-blue/80 transition-colors w-full text-center">
                                        Voir détails
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
