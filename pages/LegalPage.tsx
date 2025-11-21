

import React from 'react';
import { useSettings } from '../context/SettingsContext';

interface LegalPageProps {
  type: 'mentions' | 'cgv' | 'confidentialite';
}

export default function LegalPage({ type }: LegalPageProps): React.ReactNode {
  const { settings, isLoading } = useSettings();

  if (isLoading || !settings) {
    return <div className="text-center py-20">Chargement...</div>;
  }

  const { title, content } = settings.legal[type];

  const processedContent = content
    .replace(/{BUSINESS_NAME}/g, settings.businessInfo.name)
    .replace(/{BUSINESS_ADDRESS}/g, settings.businessInfo.address)
    .replace(/{BUSINESS_PHONE}/g, settings.businessInfo.phone)
    .replace(/{BUSINESS_EMAIL}/g, settings.businessInfo.email);

  return (
    <div className="w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold font-heading text-expert-blue mb-8">{title}</h1>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: processedContent.replace(/\n/g, '<br />') }} />
      </div>
    </div>
  );
}
