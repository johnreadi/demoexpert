import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function RepairsPage(): React.ReactNode {
  const { settings } = useSettings();
  const pageContent = settings?.pageContent?.repairs;

  if (!settings) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-expert-blue text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src={pageContent?.heroImage || "https://picsum.photos/seed/mechanic-repair/1920/1080"} alt={pageContent?.heroTitle || "Réparation & Maintenance"} className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">{pageContent?.heroTitle || "Réparation & Maintenance"}</h1>
          <p className="text-lg md:text-2xl">{pageContent?.heroSubtitle || "Diagnostic précis et réparations fiables."}</p>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="w-full mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <h2 className="text-3xl font-bold font-heading text-expert-blue mb-6">{pageContent?.contentTitle || "Un service expert"}</h2>
              <div className="text-lg mb-6" dangerouslySetInnerHTML={{ __html: pageContent?.contentDescription || "Notre équipe est équipée pour diagnostiquer et résoudre tous types de problèmes." }} />
              <ul className="space-y-4 text-lg">
                {(pageContent?.features && pageContent.features.length > 0 ? pageContent.features : [
                    "<strong>Diagnostic électronique complet</strong>",
                    "<strong>Réparation moteur</strong>",
                    "<strong>Système de freinage</strong>"
                ]).map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <i className="fas fa-check-circle text-expert-green mr-3 mt-1"></i>
                        <span dangerouslySetInnerHTML={{ __html: feature }}></span>
                    </li>
                ))}
              </ul>
            </div>
            {/* Image */}
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img src={pageContent?.contentImage || "https://picsum.photos/seed/diagnostic-tool/800/600"} alt="Outil de diagnostic branché sur un véhicule" className="w-full h-full object-cover" />
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Quels types de réparations proposez-vous ?", "acceptedAnswer": { "@type": "Answer", "text": "Diagnostic électronique, réparation moteur, freinage, pare-brise, entretien et pneus." } },
          { "@type": "Question", "name": "Proposez-vous des devis ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui, un devis précis est établi après diagnostic. Contactez-nous pour une estimation." } },
          { "@type": "Question", "name": "Quels sont les délais ?", "acceptedAnswer": { "@type": "Answer", "text": "Selon la prestation et la disponibilité des pièces. Nous vous communiquons un délai dès le diagnostic." } }
        ]
      }) }} />
    </div>
  );
}