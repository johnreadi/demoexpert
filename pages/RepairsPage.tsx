import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function RepairsPage(): React.ReactNode {
  const { settings } = useSettings();

  if (!settings) {
    return <div className="text-center py-20">Chargement...</div>;
  }

  const pageContent = settings.pageContent.repairs;

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-expert-blue text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src={pageContent.heroImage} alt={pageContent.heroTitle} className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">{pageContent.heroTitle}</h1>
          <p className="text-lg md:text-2xl">{pageContent.heroSubtitle}</p>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="w-full mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <h2 className="text-3xl font-bold font-heading text-expert-blue mb-6">{pageContent.contentTitle}</h2>
              <p className="text-lg mb-6">
                {pageContent.contentDescription}
              </p>
              <ul className="space-y-4 text-lg">
                {pageContent.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <i className="fas fa-check-circle text-expert-green mr-3 mt-1"></i>
                        <span dangerouslySetInnerHTML={{ __html: feature }}></span>
                    </li>
                ))}
              </ul>
            </div>
            {/* Image */}
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img src={pageContent.contentImage} alt="Outil de diagnostic branché sur un véhicule" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-expert-light-gray">
        <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading text-expert-blue">Un problème sur votre véhicule ?</h2>
          <p className="mt-4 text-xl text-gray-600">
            N'attendez pas que la situation s'aggrave. Contactez nos experts pour un diagnostic et un devis précis.
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