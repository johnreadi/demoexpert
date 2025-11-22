import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import { Product, ServiceInfo, Testimonial } from '../types';
import { useSettings } from '../context/SettingsContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const HeroSection = () => {
    const { settings } = useSettings();
    if (!settings) return null;

    const heroStyle: React.CSSProperties = {};
    if (settings.hero.background.type === 'color') {
        heroStyle.backgroundColor = settings.hero.background.value;
    } else {
        heroStyle.backgroundImage = `url(${settings.hero.background.value})`;
        heroStyle.backgroundSize = 'cover';
        heroStyle.backgroundPosition = 'center';
        heroStyle.backgroundRepeat = 'no-repeat';
    }

    return (
        <div className="text-white relative" style={heroStyle}>
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4 animate-fade-in-down">{settings.hero.title}</h1>
            <p className="text-lg md:text-2xl mb-8 animate-fade-in-up">{settings.hero.subtitle}</p>
            <Link
                to="/pieces"
                className="bg-expert-green hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105"
            >
                Trouvez votre pièce
            </Link>
            </div>
        </div>
    );
};

const ServiceCard: React.FC<ServiceInfo> = ({ icon, title, description, link }) => (
  <div className="bg-white p-8 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
    <div className="text-5xl text-expert-blue mb-4">
      <i className={icon}></i>
    </div>
    <h3 className="text-2xl font-bold font-heading mb-2 text-expert-blue">{title}</h3>
    <p className="mb-4">{description}</p>
    <Link to={link} className="font-bold text-expert-green hover:text-green-700">
      En savoir plus <i className="fas fa-arrow-right ml-1"></i>
    </Link>
  </div>
);

const ServicesSection = () => {
    const { settings } = useSettings();
    if (!settings) return null;
    
    return (
        <section className="py-16 bg-expert-light-gray">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {settings.services.map(service => (
                    <ServiceCard key={service.id} {...service} />
                ))}
            </div>
            </div>
        </section>
    );
};

const FeaturedProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mx-2">
        <img src={product.images?.[0] || 'https://picsum.photos/seed/product-card/800/600'} alt={product.name} className="w-full h-48 object-cover"/>
        <div className="p-4">
            <h4 className="font-bold text-lg text-expert-blue truncate">{product.name}</h4>
            <p className="text-sm text-gray-500">{product.brand} {product.model}</p>
            <Link to={`/pieces/${product.id}`} className="mt-4 inline-block bg-expert-blue text-white py-2 px-4 rounded hover:bg-expert-blue/80 transition-colors w-full text-center">
                Voir détails
            </Link>
        </div>
    </div>
);


const FeaturedProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const featuredProducts = await api.getProducts({ limit: 6 });
                setProducts(featuredProducts);
            } catch (err) {
                setError("Impossible de charger les produits à la une. Veuillez réessayer plus tard.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);


    return (
        <section className="py-16">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold font-heading text-center mb-8 text-expert-blue">Pièces à la une</h2>
                {isLoading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <ErrorMessage message={error} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                       {products.map(p => <FeaturedProductCard key={p.id} product={p} />)}
                    </div>
                )}
            </div>
        </section>
    );
};

const TestimonialCard: React.FC<Testimonial> = ({ text, author }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="italic">"{text}"</p>
        <p className="font-bold text-right mt-4">- {author}</p>
    </div>
);

const TestimonialsSection = () => {
    const { settings } = useSettings();
    if (!settings) return null;

    return (
        <section className="py-16 bg-expert-light-gray">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold font-heading text-center mb-8 text-expert-blue">Ce que disent nos clients</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {settings.testimonials.map(testimonial => (
                    <TestimonialCard key={testimonial.id} {...testimonial} />
                ))}
            </div>
            </div>
        </section>
    );
};


export default function HomePage(): React.ReactNode {
  return (
    <div>
      <HeroSection />
      <ServicesSection />
      <FeaturedProducts />
      <TestimonialsSection />
    </div>
  );
}
