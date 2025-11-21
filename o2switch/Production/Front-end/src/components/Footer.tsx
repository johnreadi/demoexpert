import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function Footer(): React.ReactNode {
  const { settings, isLoading } = useSettings();

  if (isLoading || !settings) {
    return (
      <footer className="text-white bg-expert-blue">
        <div className="w-full mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
            <div className="text-center">Chargement...</div>
        </div>
      </footer>
    );
  }

  const { businessInfo, socialLinks, footer } = settings;

  return (
    <footer className="text-white" style={{ backgroundColor: settings.themeColors?.footerBg || '#003366' }}>
      <div className="w-full mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <div className="flex justify-center text-white sm:justify-start">
               {businessInfo.logoUrl ? (
                    <img src={businessInfo.logoUrl} alt={`${businessInfo.name} logo`} className="h-10 w-auto" />
                ) : (
                   <span className="self-center text-2xl font-heading font-semibold whitespace-nowrap text-white">
                    <i className="fas fa-car-burst mr-2"></i>{businessInfo.name}
                  </span>
                )}
            </div>
            <p className="mt-4 text-center text-gray-300 sm:text-left">
              {footer.description}
            </p>
            <div className="mt-6 flex justify-center gap-4 sm:justify-start">
              <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="hover:opacity-75 transition">
                <i className="fab fa-facebook text-2xl"></i>
              </a>
              <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="hover:opacity-75 transition">
                <i className="fab fa-twitter text-2xl"></i>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:col-span-2">
            <div className="text-center sm:text-left">
              <p className="text-lg font-medium font-heading">Nos Services</p>
              <ul className="mt-4 space-y-2 text-sm">
                 {footer.servicesLinks.map(link => (
                    <li key={link.id}><Link to={link.url} className="text-gray-300 hover:text-white transition">{link.text}</Link></li>
                 ))}
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg font-medium font-heading">Informations</p>
              <ul className="mt-4 space-y-2 text-sm">
                {footer.infoLinks.map(link => (
                    <li key={link.id}><Link to={link.url} className="text-gray-300 hover:text-white transition">{link.text}</Link></li>
                 ))}
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg font-medium font-heading">Contactez-nous</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center justify-center sm:justify-start gap-2">
                  <i className="fas fa-location-dot"></i>
                  <span>{businessInfo.address}</span>
                </li>
                <li className="flex items-center justify-center sm:justify-start gap-2">
                  <i className="fas fa-phone"></i>
                  <a href={`tel:${businessInfo.phone.replace(/\s/g, '')}`} className="hover:text-white transition">{businessInfo.phone}</a>
                </li>
                <li className="flex items-center justify-center sm:justify-start gap-2">
                  <i className="fas fa-envelope"></i>
                  <a href={`mailto:${businessInfo.email}`} className="hover:text-white transition">{businessInfo.email}</a>
                </li>
                 <li className="flex items-center justify-center sm:justify-start gap-2">
                  <i className="fas fa-clock"></i>
                  <span>{businessInfo.openingHours}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-6">
          <p className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} {businessInfo.name}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
