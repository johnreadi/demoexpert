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
  const businessInfo = {
    name: input?.businessInfo?.name ?? 'Démolition Expert',
    logoUrl: input?.businessInfo?.logoUrl ?? '',
    address: input?.businessInfo?.address ?? '450 Route de Gournay, 76160 Saint-Jacques-sur-Darnétal, France',
    phone: input?.businessInfo?.phone ?? '02 35 08 18 55',
    email: input?.businessInfo?.email ?? 'contact@casseautopro.fr',
    openingHours: input?.businessInfo?.openingHours ?? 'Lun-Ven: 8h00 - 18h00, Sam: 9h00 - 12h00',
  };
  const socialLinks = {
    facebook: input?.socialLinks?.facebook ?? 'https://facebook.com',
    twitter: input?.socialLinks?.twitter ?? 'https://twitter.com',
    linkedin: input?.socialLinks?.linkedin ?? 'https://linkedin.com',
  };
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
  const f = input?.footer ?? {};
  const footer = {
    description: f?.description ?? "Votre spécialiste de la pièce automobile d'occasion et du recyclage en Normandie.",
    servicesLinks: Array.isArray(f?.servicesLinks) ? f.servicesLinks : [],
    infoLinks: Array.isArray(f?.infoLinks) ? f.infoLinks : [],
  };
  return { ...input, businessInfo, socialLinks, hero, pageContent, advancedSettings, footer } as SiteSettings;
};

// Default settings to use when API is not available
const DEFAULT_SETTINGS: SiteSettings = {
  businessInfo: {
    name: "Démolition Expert",
    logoUrl: "",
    address: "450 Route de Gournay, 76160 Saint-Jacques-sur-Darnétal, France",
    phone: "02 35 08 18 55",
    email: "contact@casseautopro.fr",
    openingHours: "Lun-Ven: 8h00 - 18h00, Sam: 9h00 - 12h00"
  },
  socialLinks: { facebook: "https://facebook.com", twitter: "https://twitter.com", linkedin: "https://linkedin.com" },
  themeColors: { headerBg: "#003366", footerBg: "#003366" },
  hero: {
    title: "Pièces d'occasion de qualité",
    subtitle: "Économisez jusqu'à 80% et recyclez !",
    background: { type: "image", value: "https://picsum.photos/seed/hero/1920/1080" }
  },
  services: [
    { id: "serv-1", icon: "fas fa-cogs", title: "Vente de Pièces", description: "Un large inventaire de pièces détachées d'occasion, testées et garanties.", link: "/pieces" },
    { id: "serv-2", icon: "fas fa-car", title: "Rachat de Véhicules", description: "Nous rachetons votre véhicule hors d'usage au meilleur prix du marché.", link: "/rachat-vehicule" },
    { id: "serv-3", icon: "fas fa-truck-pickup", title: "Enlèvement d'Épave", description: "Service d'enlèvement d'épave gratuit en Normandie. Simple et rapide.", link: "/enlevement-epave" },
    { id: "serv-4", icon: "fas fa-shield-halved", title: "Pare-brise", description: "Réparation d'impacts et remplacement. Service rapide et garanti.", link: "/pare-brise" },
    { id: "serv-5", icon: "fas fa-tools", title: "Location de Pont", description: "Louez un de nos ponts élévateurs pour faire votre mécanique.", link: "/location-pont" },
    { id: "serv-6", icon: "fas fa-wrench", title: "Réparation & Entretien", description: "Diagnostic, réparation et entretien toutes marques.", link: "/entretien" }
  ],
  testimonials: [
    { id: "test-1", text: "Service rapide et pièce conforme. J'ai économisé une fortune sur la réparation de ma Clio. Je recommande !!", author: "Julien D., Rouen" },
    { id: "test-2", text: "Enlèvement de mon épave en 48h, tout s'est très bien passé. Équipe très professionnelle.", author: "Sylvie M., Le Havre" },
    { id: "test-3", text: "J'ai trouvé un alternateur pour ma 308 que je ne trouvais nulle part ailleurs. Merci Démolition Expert !", author: "Garage Martin" }
  ],
  footer: {
    description: "Votre spécialiste de la pièce automobile d'occasion et du recyclage en Normandie.",
    servicesLinks: [
      { id: "fsl-1", text: "Pièces Détachées", url: "/pieces" },
      { id: "fsl-2", text: "Rachat de Véhicules", url: "/rachat-vehicule" },
      { id: "fsl-3", text: "Enlèvement d'Épaves", url: "/enlevement-epave" },
      { id: "fsl-4", text: "Réparation", url: "/reparation" }
    ],
    infoLinks: [
      { id: "fil-1", text: "Contact", url: "/contact" },
      { id: "fil-3", text: "CGV", url: "/cgv" },
      { id: "fil-4", text: "Mentions Légales", url: "/mentions-legales" }
    ]
  },
  legal: {
    mentions: { title: "Mentions Légales", content: "" },
    cgv: { title: "Conditions Générales de Vente", content: "" },
    confidentialite: { title: "Politique de Confidentialité", content: "" }
  },
  liftRental: { pricingTiers: [ { duration: 1, price: 50 }, { duration: 2, price: 90 }, { duration: 4, price: 160 } ], unavailableDates: ["2025-12-25", "2026-01-01"] },
  pageContent: {
    repairs: { heroTitle: "Réparation & Maintenance", heroSubtitle: "Diagnostic précis et réparations fiables.", heroImage: "https://picsum.photos/seed/mechanic-repair/1920/1080", contentTitle: "Un service expert", contentDescription: "Notre équipe est équipée pour diagnostiquer et résoudre tous types de problèmes.", contentImage: "https://picsum.photos/seed/diagnostic-tool/800/600", features: [ "<strong>Diagnostic électronique complet</strong>", "<strong>Réparation moteur</strong>", "<strong>Système de freinage</strong>" ] },
    maintenance: { heroTitle: "Vidange & Entretien", heroSubtitle: "Assurez la longévité de votre moteur.", heroImage: "https://picsum.photos/seed/oil-change/1920/1080", contentTitle: "L'entretien, clé de la fiabilité", contentDescription: "Nous proposons des forfaits d'entretien complets adaptés.", contentImage: "https://picsum.photos/seed/car-filters/800/600", features: [ "<strong>Vidange huile moteur</strong>", "<strong>Remplacement des filtres</strong>", "<strong>Contrôle des points de sécurité</strong>" ] },
    tires: { heroTitle: "Service Pneus", heroSubtitle: "Vente, montage et équilibrage.", heroImage: "https://picsum.photos/seed/tire-fitting/1920/1080", contentTitle: "Votre sécurité, notre priorité", contentDescription: "Nous proposons une large gamme de pneus neufs et d'occasion.", contentImage: "https://picsum.photos/seed/wheel-balancing/800/600", features: [ "<strong>Vente de pneus neufs et d'occasion</strong>", "<strong>Montage et équilibrage</strong>", "<strong>Réparation de crevaison</strong>" ] }
  },
  advancedSettings: {
    smtp: { host: "smtp.example.com", port: 587, user: "user@example.com", pass: "" },
    ai: { chatModel: "gemini-2.5-flash", estimationModel: "gemini-2.5-flash" },
    seo: { metaTitle: "Démolition Expert", metaDescription: "Pièces auto d'occasion garanties.", keywords: "casse auto, pièces occasion" },
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