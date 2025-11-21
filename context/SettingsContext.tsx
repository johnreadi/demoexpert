import React, { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../api';
import type { SiteSettings } from '../types';

interface SettingsContextType {
  settings: SiteSettings | null;
  isLoading: boolean;
  updateSettings: (newSettings: SiteSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const normalizeSettings = (input: any): SiteSettings => {
  const heroBg = input?.hero?.background ?? (input?.hero?.backgroundImage ? { type: 'image', value: input.hero.backgroundImage } : { type: 'color', value: '#003366' });
  const hero = { title: input?.hero?.title ?? '', subtitle: input?.hero?.subtitle ?? '', background: heroBg };
  const pc = input?.pageContent ?? {};
  const normalizePage = (p: any) => ({ heroTitle: p?.heroTitle ?? '', heroSubtitle: p?.heroSubtitle ?? '', heroImage: p?.heroImage ?? '', contentTitle: p?.contentTitle ?? '', contentDescription: p?.contentDescription ?? '', contentImage: p?.contentImage ?? '', features: Array.isArray(p?.features) ? p.features : [] });
  const pageContent = { repairs: normalizePage(pc?.repairs ?? {}), maintenance: normalizePage(pc?.maintenance ?? {}), tires: normalizePage(pc?.tires ?? {}) };
  const adv = input?.advancedSettings ?? {};
  const advancedSettings = {
    smtp: { host: adv?.smtp?.host ?? '', port: adv?.smtp?.port ?? 0, user: adv?.smtp?.user ?? '', pass: adv?.smtp?.pass ?? '' },
    ai: { chatModel: adv?.ai?.chatModel ?? '', estimationModel: adv?.ai?.estimationModel ?? '' },
    seo: { metaTitle: adv?.seo?.metaTitle ?? '', metaDescription: adv?.seo?.metaDescription ?? '', keywords: adv?.seo?.keywords ?? '' },
    security: { allowPublicRegistration: adv?.security?.allowPublicRegistration ?? true }
  };
  return { ...input, hero, pageContent, advancedSettings } as SiteSettings;
};

// Default settings to use when API is not available
const DEFAULT_SETTINGS: SiteSettings = {
  businessInfo: { 
    name: "Démolition Expert", 
    logoUrl: "", 
    address: "123 Rue de la Casse, 76000 Rouen", 
    phone: "02 35 00 00 00", 
    email: "contact@demoexpert.fr", 
    openingHours: "Lun-Ven: 9h-18h, Sam: 9h-12h" 
  },
  socialLinks: { facebook: "", twitter: "", linkedin: "" },
  themeColors: { headerBg: "#003366", footerBg: "#003366" },
  hero: { 
    title: "Bienvenue chez Démolition Expert", 
    subtitle: "Vente de pièces auto d'occasion, rachat de véhicules, enlèvement d'épaves", 
    background: { type: "color", value: "#003366" } 
  },
  services: [],
  testimonials: [],
  footer: { 
    description: "Votre expert en pièces automobiles d'occasion depuis 1995", 
    servicesLinks: [], 
    infoLinks: [] 
  },
  legal: { 
    mentions: { title: "Mentions Légales", content: "" }, 
    cgv: { title: "Conditions Générales de Vente", content: "" }, 
    confidentialite: { title: "Politique de Confidentialité", content: "" } 
  },
  liftRental: { 
    pricingTiers: [{ duration: 1, price: 50 }, { duration: 2, price: 90 }, { duration: 4, price: 160 }], 
    unavailableDates: [] 
  },
  pageContent: {
    repairs: { 
      heroTitle: "", 
      heroSubtitle: "", 
      heroImage: "", 
      contentTitle: "", 
      contentDescription: "", 
      contentImage: "", 
      features: [] 
    },
    maintenance: { 
      heroTitle: "", 
      heroSubtitle: "", 
      heroImage: "", 
      contentTitle: "", 
      contentDescription: "", 
      contentImage: "", 
      features: [] 
    },
    tires: { 
      heroTitle: "", 
      heroSubtitle: "", 
      heroImage: "", 
      contentTitle: "", 
      contentDescription: "", 
      contentImage: "", 
      features: [] 
    }
  },
  advancedSettings: {
    smtp: { host: "", port: 0, user: "", pass: "" },
    ai: { chatModel: "", estimationModel: "" },
    seo: { metaTitle: "", metaDescription: "", keywords: "" },
    security: { allowPublicRegistration: true }
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const siteSettings = await api.getSiteSettings();
        setSettings(normalizeSettings(siteSettings));
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
        // Use default settings if API fails
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: SiteSettings) => {
    try {
        const updatedSettings = await api.updateSiteSettings(newSettings);
        setSettings(normalizeSettings(updatedSettings));
    } catch(error) {
        console.error("Failed to update settings:", error);
        throw error; // Re-throw to be caught in the admin panel
    }
  };


  const value = {
    settings,
    isLoading,
    updateSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};