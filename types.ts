export enum PartCategory {
  MECANIQUE = 'Mécanique',
  ELECTRICITE = 'Électricité',
  CARROSSERIE = 'Carrosserie',
  AUTRE = 'Autre'
}

export interface Product {
  id: string;
  name: string;
  oemRef: string;
  brand: string;
  model: string;
  year: number;
  category: PartCategory;
  price: number;
  condition: 'Neuf' | 'Bon état' | 'Occasion';
  warranty: string;
  compatibility: string;
  images: string[];
  description: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface Bid {
  userId: string;
  bidderName: string;
  amount: number;
  timestamp: Date;
}

export interface Auction {
  id: string;
  vehicle: {
    name: string;
    brand: string;
    model: string;
    year: number;
    mileage: number;
    description: string;
    images: string[];
    videos?: string[];
  };
  startingPrice: number;
  currentBid: number;
  bidCount: number;
  bids: Bid[];
  endDate: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // For mock updates
  role: 'Admin' | 'Staff';
  status: 'approved' | 'pending';
}

export interface AdminMessage {
  id: string;
  from: string; // e.g., 'Formulaire de Contact'
  senderName: string;
  senderEmail: string;
  userId?: string; // Link to user if submitted while logged in
  subject: string;
  content: string;
  receivedAt: Date;
  isRead: boolean;
  isArchived: boolean;
  status: 'pending' | 'replied';
  attachment?: {
    name: string;
    url: string; 
  };
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  image: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  source: string; // 'Utilisateur', 'Message entrant', 'Manuel'
}

export interface LiftRentalBooking {
    id: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    date: string;
    time: string;
    duration: number;
    price: number;
    status: 'pending' | 'confirmed' | 'cancelled';
}

export interface AuditLogEntry {
    id: string;
    timestamp: Date;
    user: string; // User name or ID
    action: string; // e.g., 'USER_DELETED', 'SETTINGS_UPDATED'
    details: string; // e.g., 'Deleted user john.doe@test.com', 'Updated business address'
}


// --- Site Settings Types ---

export interface HeroBackground {
    type: 'color' | 'image';
    value: string; // Hex color or image URL
}

export interface HeroInfo {
  title: string;
  subtitle: string;
  background: HeroBackground;
}

export interface ServiceInfo {
  id: string;
  icon: string;
  title: string;
  description: string;
  link: string;
}

export interface Testimonial {
  id: string;
  text: string;
  author: string;
}

export interface LegalContent {
    title: string;
    content: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string; // HTML ou texte enrichi
}

export interface FooterLink {
  id: string;
  text: string;
  url: string;
}

export interface AdvancedSettings {
    smtp: {
        host: string;
        port: number;
        user: string;
        pass: string;
    };
    ai: {
        chatModel: string;
        estimationModel: string;
    };
    seo: {
        metaTitle: string;
        metaDescription: string;
        keywords: string;
    };
    security: {
        allowPublicRegistration: boolean;
    };
}

export interface ServicePageSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  contentTitle: string;
  contentDescription: string;
  contentImage: string;
  features: string[];
}


export interface SiteSettings {
  businessInfo: {
    name: string;
    logoUrl: string;
    address: string;
    phone: string;
    email: string;
    openingHours: string;
  };
  socialLinks: {
    facebook: string;
    twitter: string;
    linkedin: string;
  };
  themeColors: {
      headerBg: string;
      footerBg: string;
  };
  hero: HeroInfo;
  services: ServiceInfo[];
  testimonials: Testimonial[];
  footer: {
    description: string;
    servicesLinks: FooterLink[];
    infoLinks: FooterLink[];
  };
  legal: {
      mentions: LegalContent;
      cgv: LegalContent;
      confidentialite: LegalContent;
  };
  faq: FAQItem[];
  liftRental: {
      pricingTiers: { duration: number; price: number }[];
      unavailableDates: string[]; // dates in YYYY-MM-DD format
  };
  pageContent: {
      repairs: ServicePageSettings;
      maintenance: ServicePageSettings;
      tires: ServicePageSettings;
      vhu: ServicePageSettings;
  };
  advancedSettings: AdvancedSettings;
}
