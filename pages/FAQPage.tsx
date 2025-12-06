import React from 'react';
import { useSettings } from '../context/SettingsContext';

export default function FAQPage(): React.ReactNode {
  const { settings, isLoading } = useSettings();

  if (isLoading || !settings) {
    return <div className="text-center py-20">Chargement...</div>;
  }

  const faq = settings.faq || [];

  return (
    <div>
      <div className="bg-expert-blue text-white py-16">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Foire aux Questions</h1>
          <p className="text-lg md:text-2xl text-expert-light-gray">
            Toutes les réponses aux questions les plus fréquentes sur nos services.
          </p>
        </div>
      </div>

      <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-xl divide-y divide-gray-200">
          {faq.length === 0 && (
            <p className="text-center text-gray-500">Aucune question pour le moment.</p>
          )}
          {faq.map(item => (
            <details key={item.id} className="group py-4">
              <summary className="flex items-center justify-between cursor-pointer text-lg font-semibold text-expert-blue">
                <span>{item.question}</span>
                <span className="ml-4 text-expert-blue group-open:rotate-180 transition-transform">
                  <i className="fas fa-chevron-down"></i>
                </span>
              </summary>
              <div className="mt-3 text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: item.answer.replace(/\n/g, '<br />') }} />
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
