import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

// Note : Ce composant utilise <Link> et <NavLink> de react-router-dom.
// Il s'intègre correctement avec le <HashRouter> défini dans App.tsx,
// qui est le routeur principal de l'application.

const NavItem: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `block py-2 px-3 text-white rounded hover:bg-black/20 md:hover:bg-transparent md:border-0 md:hover:text-expert-green md:p-0 transition-colors duration-300 ${isActive ? 'text-expert-green font-bold' : ''}`
    }
  >
    {children}
  </NavLink>
);

export default function Header(): React.ReactNode {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { settings, isLoading } = useSettings();

  // Show loading state while settings are being fetched
  if (isLoading) {
    return (
      <header className="shadow-md sticky top-0 z-50" style={{ backgroundColor: '#003366' }}>
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between p-4">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex md:order-2 items-center space-x-3 rtl:space-x-reverse">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse hidden lg:block"></div>
              <div className="h-10 w-10 bg-gray-200 rounded animate-pulse md:hidden"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // If settings failed to load, use default values to prevent blank page
  const safeSettings = settings || {
    businessInfo: { 
      name: "Démolition Expert", 
      logoUrl: "", 
      address: "123 Rue de la Casse, 76000 Rouen", 
      phone: "02 35 00 00 00", 
      email: "contact@demoexpert.fr", 
      openingHours: "Lun-Ven: 9h-18h, Sam: 9h-12h" 
    },
    themeColors: { headerBg: "#003366", footerBg: "#003366" }
  } as any;

  const navLinks = [
    { to: '/', text: 'Accueil' },
    { to: '/pieces', text: 'Pièces Détachées' },
    { to: '/offres', text: 'Offres' },
    { to: '/rachat-vehicule', text: 'Rachat de Véhicules' },
    { to: '/enlevement-epave', text: 'Enlèvement d\'Épaves' },
    { to: '/contact', text: 'Contact' },
  ];
  
  const closeMenuAndLogout = () => {
      logout();
      setIsMenuOpen(false);
  }
  
  const closeMenu = () => {
      setIsMenuOpen(false);
  }

  return (
    <header className="shadow-md sticky top-0 z-50" style={{ backgroundColor: safeSettings.themeColors?.headerBg || '#003366' }}>
      <nav className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between p-4">
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
             {safeSettings.businessInfo.logoUrl ? (
                <img src={safeSettings.businessInfo.logoUrl} alt={`${safeSettings.businessInfo.name} logo`} className="h-10 w-auto" />
            ) : (
                <span className="self-center text-2xl font-heading font-semibold whitespace-nowrap text-white">
                    <i className="fas fa-car-burst mr-2"></i>{safeSettings.businessInfo.name}
                </span>
            )}
          </Link>
          <div className="flex md:order-2 items-center space-x-3 rtl:space-x-reverse">
            <a href={`tel:${safeSettings.businessInfo.phone.replace(/\s/g, '')}`} className="hidden lg:inline-block text-white bg-expert-green hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-center transition-colors">
              <i className="fas fa-phone mr-2"></i>{safeSettings.businessInfo.phone}
            </a>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-200 rounded-lg md:hidden hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-gray-600"
              aria-controls="navbar-sticky"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
          <div
            className={`items-center justify-between ${isMenuOpen ? 'block' : 'hidden'} w-full md:flex md:w-auto md:order-1`}
            id="navbar-sticky"
          >
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-700 rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:items-center">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavItem to={link.to} onClick={closeMenu}>{link.text}</NavItem>
                </li>
              ))}
              <li className="mt-4 md:mt-0 md:ml-4 border-t border-gray-600 md:border-none pt-4 md:pt-0">
                 {isAuthenticated ? (
                    <div className="flex items-center space-x-4">
                        <NavItem to="/compte" onClick={closeMenu}>
                            <i className="fas fa-user-circle mr-2"></i>Mon Compte
                        </NavItem>
                        {user?.role === 'Admin' && (
                           <NavItem to="/admin" onClick={closeMenu}>
                            <i className="fas fa-user-shield mr-2"></i>Admin
                           </NavItem>
                        )}
                        <button onClick={closeMenuAndLogout} className="block py-2 px-3 text-red-400 rounded hover:bg-red-500/20 md:hover:bg-transparent md:border-0 md:hover:text-red-400 md:p-0 transition-colors duration-300">
                            <i className="fas fa-sign-out-alt mr-2"></i>Déconnexion
                        </button>
                    </div>
                 ) : (
                    <NavItem to="/connexion" onClick={closeMenu}>
                        <i className="fas fa-sign-in-alt mr-2"></i>Connexion
                    </NavItem>
                 )}
               </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}