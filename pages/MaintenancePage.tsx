import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function MaintenancePage(): React.ReactNode {
  const { settings } = useSettings();
  const pageContent = settings?.pageContent?.maintenance;

  if (!settings) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-expert-blue text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src={pageContent?.heroImage || "https://picsum.photos/seed/oil-change/1920/1080"} alt={pageContent?.heroTitle || "Vidange & Entretien"} className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">{pageContent?.heroTitle || "Vidange & Entretien"}</h1>
          <p className="text-lg md:text-2xl">{pageContent?.heroSubtitle || "Assurez la longévité de votre moteur."}</p>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="w-full mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
             {/* Image */}
             <div className="rounded-lg overflow-hidden shadow-xl md:order-last">
              <img src={pageContent?.contentImage || "https://picsum.photos/seed/car-filters/800/600"} alt="Filtres à huile, air et habitacle" className="w-full h-full object-cover" />
            </div>
            {/* Text Content */}
            <div>
              <h2 className="text-3xl font-bold font-heading text-expert-blue mb-6">{pageContent?.contentTitle || "L'entretien, clé de la fiabilité"}</h2>
              <div className="text-lg mb-6" dangerouslySetInnerHTML={{ __html: pageContent?.contentDescription || "Nous proposons des forfaits d'entretien complets adaptés." }} />
              <ul className="space-y-4 text-lg">
                {(pageContent?.features && pageContent.features.length > 0 ? pageContent.features : [
                    "<strong>Vidange huile moteur</strong>",
                    "<strong>Remplacement des filtres</strong>",
                    "<strong>Contrôle des points de sécurité</strong>"
                ]).map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <i className="fas fa-check-circle text-expert-green mr-3 mt-1"></i>
                        <span dangerouslySetInnerHTML={{ __html: feature }}></span>
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-expert-light-gray">
        <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading text-expert-blue">Planifiez l'entretien de votre véhicule</h2>
          <p className="mt-4 text-xl text-gray-600">
            Ne négligez pas la santé de votre moteur. Prenez rendez-vous pour un entretien complet et roulez l'esprit tranquille.
          </p>
          <Link 
            to="/contact" 
            className="mt-8 inline-block bg-expert-green hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105"
          >
            Prendre Rendez-vous
          </Link>
        </div>
      </div>
    </div>
  );
}