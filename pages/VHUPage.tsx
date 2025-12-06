import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function VHUPage(): React.ReactNode {
  const { settings, isLoading } = useSettings();

  if (isLoading || !settings) {
    return <div className="text-center py-20">Chargement...</div>;
  }

  const vhu = settings.pageContent.vhu;

  return (
    <div>
      <div className="relative bg-expert-blue text-white overflow-hidden">
        <div className="absolute inset-0">
          {vhu.heroImage && (
            <img src={vhu.heroImage} alt={vhu.heroTitle} className="w-full h-full object-cover opacity-30" />
          )}
        </div>
        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">{vhu.heroTitle}</h1>
          <p className="text-lg md:text-2xl">{vhu.heroSubtitle}</p>
        </div>
      </div>

      <div className="w-full mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold font-heading text-expert-blue mb-6">{vhu.contentTitle}</h2>
            <p className="text-lg mb-6">{vhu.contentDescription}</p>
            {vhu.features && vhu.features.length > 0 && (
              <ul className="space-y-3 text-lg">
                {vhu.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <i className="fas fa-check-circle text-expert-green mr-3 mt-1"></i>
                    <span dangerouslySetInnerHTML={{ __html: feature }} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold font-heading text-center text-expert-blue mb-6">Demander un enlèvement</h2>
            <p className="text-center mb-6">Un conseiller vous rappelle pour planifier l’enlèvement et vérifier les documents.</p>
            <div className="grid gap-3">
              <Link to="/contact" className="w-full bg-expert-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg text-center transition">Contacter nos équipes</Link>
              <Link to="/enlevement-epave" className="w-full bg-expert-blue hover:bg-expert-blue/80 text-white font-bold py-3 px-6 rounded-lg text-lg text-center transition">Enlèvement d’épave gratuit</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-expert-light-gray">
        <div className="max-w-4xl mx-auto text-center py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold font-heading text-expert-blue">Besoin d’aide pour le dossier ?</h2>
          <p className="mt-4 text-xl text-gray-600">Nous vous guidons sur les documents et la procédure, étape par étape.</p>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "L’enlèvement de VHU est-il gratuit ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui, l’enlèvement est gratuit en Normandie selon les critères d’éligibilité." } },
              { "@type": "Question", "name": "Quels documents sont nécessaires ?", "acceptedAnswer": { "@type": "Answer", "text": "Carte grise barrée et signée, certificat de non-gage et pièce d’identité." } },
              { "@type": "Question", "name": "Recevrai-je un certificat de destruction ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui, un certificat officiel vous est remis après la destruction réglementaire." } }
            ]
          })
        }}
      />
    </div>
  );
}