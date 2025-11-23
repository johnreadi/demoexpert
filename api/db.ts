// FIX: Import PartCategory as a value for use in mock data generation.
import { PartCategory } from '../types';
import type { Product, Auction, Bid, User, AdminMessage, SiteSettings, LiftRentalBooking, AuditLogEntry, BlogPost, Contact } from '../types';

// --- MOCK DATA ---
// Placed here to avoid creating a new file, keeping the changes minimal.

const MOCK_SITE_SETTINGS: SiteSettings = {
    businessInfo: {
        name: 'Démolition Expert',
        logoUrl: '',
        address: '450 Route de Gournay, 76160 Saint-Jacques-sur-Darnétal, France',
        phone: '02 35 08 18 55',
        email: 'contact@casseautopro.fr',
        openingHours: 'Lun-Ven: 8h00 - 18h00, Sam: 9h00 - 12h00',
    },
    socialLinks: { facebook: 'https://facebook.com', twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' },
    themeColors: { headerBg: '#003366', footerBg: '#003366' },
    hero: {
        title: "Pièces d'occasion de qualité",
        subtitle: "Économisez jusqu'à 80% et recyclez !",
        background: { type: 'image', value: 'https://picsum.photos/seed/hero/1920/1080' }
    },
    services: [
        { id: 'serv-1', icon: "fas fa-cogs", title: "Vente de Pièces", description: "Un large inventaire de pièces détachées d'occasion, testées et garanties.", link: "/pieces" },
        { id: 'serv-2', icon: "fas fa-car", title: "Rachat de Véhicules", description: "Nous rachetons votre véhicule hors d'usage au meilleur prix du marché.", link: "/rachat-vehicule" },
        { id: 'serv-3', icon: "fas fa-truck-pickup", title: "Enlèvement d'Épave", description: "Service d'enlèvement d'épave gratuit en Normandie. Simple et rapide.", link: "/enlevement-epave" },
        { id: 'serv-4', icon: "fas fa-shield-halved", title: "Pare-brise", description: "Réparation d'impacts et remplacement. Service rapide et garanti.", link: "/pare-brise" },
        { id: 'serv-5', icon: "fas fa-tools", title: "Location de Pont", description: "Louez un de nos ponts élévateurs pour faire votre mécanique.", link: "/location-pont" },
        { id: 'serv-6', icon: "fas fa-wrench", title: "Réparation & Entretien", description: "Diagnostic, réparation et entretien toutes marques.", link: "/reparation" },
    ],
    testimonials: [
        { id: 'test-1', text: "Service rapide et pièce conforme. J'ai économisé une fortune sur la réparation de ma Clio. Je recommande !!", author: "Julien D., Rouen" },
        { id: 'test-2', text: "Enlèvement de mon épave en 48h, tout s'est très bien passé. Équipe très professionnelle.", author: "Sylvie M., Le Havre" },
        { id: 'test-3', text: "J'ai trouvé un alternateur pour ma 308 que je ne trouvais nulle part ailleurs. Merci Démolition Expert !", author: "Garage Martin" }
    ],
    footer: {
        description: "Votre spécialiste de la pièce automobile d'occasion et du recyclage en Normandie.",
        servicesLinks: [
            { id: 'fsl-1', text: 'Pièces Détachées', url: '/pieces' },
            { id: 'fsl-2', text: 'Rachat de Véhicules', url: '/rachat-vehicule' },
            { id: 'fsl-3', text: 'Enlèvement d\'Épaves', url: '/enlevement-epave' },
            { id: 'fsl-4', text: 'Réparation', url: '/reparation' },
        ],
        infoLinks: [
            { id: 'fil-1', text: 'Contact', url: '/contact' },
            { id: 'fil-3', text: 'CGV', url: '/cgv' },
            { id: 'fil-4', text: 'Mentions Légales', url: '/mentions-legales' },
        ]
    },
    legal: {
        mentions: { title: "Mentions Légales", content: "<strong>Éditeur du site :</strong>\n{BUSINESS_NAME}\nAdresse : {BUSINESS_ADDRESS}\n..." },
        cgv: { title: "Conditions Générales de Vente", content: "<strong>Article 1 : Objet</strong>\nLes présentes conditions régissent les ventes..." },
        confidentialite: { title: "Politique de Confidentialité", content: "La société {BUSINESS_NAME}, s'engage à ce que la collecte..." },
    },
    liftRental: {
        pricingTiers: [ { duration: 1, price: 50 }, { duration: 2, price: 90 }, { duration: 4, price: 160 } ],
        unavailableDates: ["2025-12-25", "2026-01-01"],
    },
    pageContent: {
        repairs: { heroTitle: "Réparation & Maintenance", heroSubtitle: "Diagnostic précis et réparations fiables.", heroImage: "https://picsum.photos/seed/mechanic-repair/1920/1080", contentTitle: "Un service expert", contentDescription: "Notre équipe est équipée pour diagnostiquer et résoudre tous types de problèmes.", contentImage: "https://picsum.photos/seed/diagnostic-tool/800/600", features: [ "<strong>Diagnostic électronique complet</strong>", "<strong>Réparation moteur</strong>", "<strong>Système de freinage</strong>" ] },
        maintenance: { heroTitle: "Vidange & Entretien", heroSubtitle: "Assurez la longévité de votre moteur.", heroImage: "https://picsum.photos/seed/oil-change/1920/1080", contentTitle: "L'entretien, clé de la fiabilité", contentDescription: "Nous proposons des forfaits d'entretien complets adaptés.", contentImage: "https://picsum.photos/seed/car-filters/800/600", features: [ "<strong>Vidange huile moteur</strong>", "<strong>Remplacement des filtres</strong>", "<strong>Contrôle des points de sécurité</strong>" ] },
        tires: { heroTitle: "Service Pneus", heroSubtitle: "Vente, montage et équilibrage.", heroImage: "https://picsum.photos/seed/tire-fitting/1920/1080", contentTitle: "Votre sécurité, notre priorité", contentDescription: "Nous proposons une large gamme de pneus neufs et d'occasion.", contentImage: "https://picsum.photos/seed/wheel-balancing/800/600", features: [ "<strong>Vente de pneus neufs et d'occasion</strong>", "<strong>Montage et équilibrage</strong>", "<strong>Réparation de crevaison</strong>" ] },
    },
    advancedSettings: {
        smtp: { host: 'smtp.example.com', port: 587, user: 'user@example.com', pass: '' },
        ai: { chatModel: 'gemini-2.5-flash', estimationModel: 'gemini-2.5-flash' },
        seo: { metaTitle: 'Démolition Expert', metaDescription: "Pièces auto d'occasion garanties.", keywords: 'casse auto, pièces occasion' },
        security: { allowPublicRegistration: true },
    }
};

const MOCK_PRODUCTS: Product[] = Array.from({ length: 50 }, (_, i) => ({
    id: `prod-${i + 1}`, name: `Alternateur ${['Renault', 'Peugeot', 'Citroën'][i%3]} ${['Clio', '208', 'C3'][i%3]}`,
    oemRef: `REF${8200660035 + i}`, brand: ['Renault', 'Peugeot', 'Citroën'][i%3], model: ['Clio', '208', 'C3'][i%3],
    year: 2015 + (i % 8), category: Object.values(PartCategory)[i % 3], price: 50 + (i * 5) % 150,
    condition: i % 3 === 0 ? 'Bon état' : 'Occasion', warranty: '3 mois', compatibility: `Modèle Phase ${i%2 + 1}`,
    images: [`https://picsum.photos/seed/prod${i+1}/400/300`], description: `Pièce d'occasion en excellent état.`,
}));

const MOCK_USERS: User[] = [
    { id: 'user-admin-1', name: 'Admin Expert', email: 'admin@expert.fr', role: 'Admin', status: 'approved', password: 'password123' },
    { id: 'user-staff-1', name: 'Jean Dupont', email: 'jean.dupont@expert.fr', role: 'Staff', status: 'approved', password: 'password123' },
    { id: 'user-staff-2', name: 'Marie Curie', email: 'marie.curie@expert.fr', role: 'Staff', status: 'pending', password: 'password123' },
];

const MOCK_AUCTIONS: Auction[] = [
  { 
    id: 'auc-1', 
    vehicle: { 
      name: 'Peugeot 208 GT Line', 
      brand: 'Peugeot', 
      model: '208', 
      year: 2019, 
      mileage: 55000, 
      description: 'Superbe Peugeot 208 GT Line...', 
      images: ['https://picsum.photos/seed/auc1-1/800/600'] 
    }, 
    startingPrice: 8000, 
    currentBid: 8300, 
    bidCount: 6, 
    bids: [ 
      { 
        userId: 'user-staff-2', 
        bidderName: 'Marie Curie', 
        amount: 8300, 
        timestamp: new Date(Date.now() - 3600000 * 1) 
      } 
    ], 
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 49) 
  },
  { 
    id: 'auc-2', 
    vehicle: { 
      name: 'Volkswagen Golf VII', 
      brand: 'Volkswagen', 
      model: 'Golf', 
      year: 2017, 
      mileage: 89000, 
      description: 'Volkswagen Golf 7 en excellent état...', 
      images: ['https://picsum.photos/seed/auc2-1/800/600'] 
    }, 
    startingPrice: 10000, 
    currentBid: 10500, 
    bidCount: 8, 
    bids: [ 
      { 
        userId: 'user-staff-1', 
        bidderName: 'Jean Dupont', 
        amount: 10500, 
        timestamp: new Date(Date.now() - 3600000 * 1) 
      } 
    ], 
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5) 
  },
];

const MOCK_ADMIN_MESSAGES: AdminMessage[] = [
    { id: 'msg-1', from: 'Formulaire d\'enlèvement', senderName: 'Paul Martin', senderEmail: 'paul.martin@email.com', subject: 'Demande enlèvement Clio 2', content: 'Bonjour, je souhaiterais faire enlever ma Renault Clio 2.', receivedAt: new Date(Date.now() - 3600000 * 2), isRead: false, isArchived: false, status: 'pending' },
    { id: 'msg-2', from: 'Formulaire de Contact', senderName: 'Marie Curie', senderEmail: 'marie.curie@expert.fr', subject: 'Question sur une pièce', content: 'Bonjour, avez-vous un alternateur pour une Peugeot 308 ?', receivedAt: new Date(Date.now() - 3600000 * 24), isRead: true, isArchived: false, status: 'replied' },
];

// In-memory database object
let db = {
    products: MOCK_PRODUCTS,
    auctions: MOCK_AUCTIONS,
    users: MOCK_USERS,
    messages: MOCK_ADMIN_MESSAGES,
    settings: MOCK_SITE_SETTINGS,
    bookings: [] as LiftRentalBooking[],
    logs: [] as AuditLogEntry[],
    blog: [] as BlogPost[],
    contacts: [] as Contact[],
};


// --- DATABASE FUNCTIONS ---

export const getSiteSettings = (): SiteSettings => db.settings;
export const updateSiteSettings = (newSettings: SiteSettings): SiteSettings => {
    db.settings = { ...db.settings, ...newSettings };
    return db.settings;
};

export const getProducts = (filters: { category?: string; brand?: string; model?: string; limit?: number }): Product[] => {
    let products = db.products;
    if (filters.category) products = products.filter(p => p.category === filters.category);
    if (filters.brand) products = products.filter(p => p.brand.toLowerCase().includes(filters.brand.toLowerCase()));
    if (filters.limit) products = products.slice(0, filters.limit);
    return products;
};

export const getProductById = (id: string): Product | undefined => db.products.find(p => p.id === id);
export const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = { ...productData, id: `prod-${Date.now()}` };
    db.products.unshift(newProduct);
    return newProduct;
};
export const updateProduct = (productId: string, productData: Partial<Product>): Product => {
    const index = db.products.findIndex(p => p.id === productId);
    if (index === -1) throw new Error("Product not found");
    db.products[index] = { ...db.products[index], ...productData };
    return db.products[index];
};
export const deleteProduct = (productId: string): { success: boolean } => {
    db.products = db.products.filter(p => p.id !== productId);
    return { success: true };
};

export const getAuctions = (): Auction[] => db.auctions;
export const getAuctionById = (id: string): Auction | undefined => db.auctions.find(a => a.id === id);

export const addBid = (auctionId: string, bidAmount: number, userId: string, bidderName: string): Auction => {
    const auction = db.auctions.find(a => a.id === auctionId);
    if (!auction) throw new Error("Auction not found");
    if (bidAmount <= auction.currentBid) throw new Error("Bid must be higher than current bid");
    
    auction.currentBid = bidAmount;
    auction.bidCount++;
    auction.bids.unshift({ userId, bidderName, amount: bidAmount, timestamp: new Date() });
    return auction;
};

export const addAuction = (auctionData: Omit<Auction, 'id' | 'currentBid' | 'bidCount' | 'bids'>): Auction => {
    const newAuction: Auction = {
        ...auctionData,
        id: `auc-${Date.now()}`,
        currentBid: auctionData.startingPrice,
        bidCount: 0,
        bids: [],
    };
    db.auctions.unshift(newAuction);
    return newAuction;
};

export const updateAuction = (auctionId: string, auctionData: Partial<Auction>): Auction => {
    const index = db.auctions.findIndex(a => a.id === auctionId);
    if (index === -1) throw new Error("Auction not found");
    db.auctions[index] = { ...db.auctions[index], ...auctionData };
    return db.auctions[index];
};

export const deleteAuction = (auctionId: string): { success: boolean } => {
    db.auctions = db.auctions.filter(a => a.id !== auctionId);
    return { success: true };
};

const addMessageToDb = (message: Omit<AdminMessage, 'id'>): AdminMessage => {
    const newMessage: AdminMessage = { ...message, id: `msg-${Date.now()}` };
    db.messages.unshift(newMessage);
    return newMessage;
};

export const submitContactForm = (data: any): { success: boolean } => {
    addMessageToDb({
        from: 'Formulaire de Contact', senderName: data.name, senderEmail: data.email, subject: data.subject, content: data.message,
        receivedAt: new Date(), isRead: false, isArchived: false, status: 'pending'
    });
    return { success: true };
};

export const submitBuybackRequest = (data: any): { success: true, estimation: string } => {
    addMessageToDb({
        from: "Rachat de véhicule", senderName: data.name, senderEmail: data.email, subject: `Rachat: ${data.brand} ${data.model}`, 
        content: `Demande de rachat pour ${data.brand} ${data.model} (${data.year}).`,
        receivedAt: new Date(), isRead: false, isArchived: false, status: 'pending'
    });
    return { success: true, estimation: "Notre équipe analyse votre demande et vous contactera avec une estimation détaillée très prochainement." };
};

export const submitScrapRemovalRequest = (data: any): { success: boolean } => { addMessageToDb({ from: "Enlèvement d'épave", senderName: data.name, senderEmail: data.email, subject: `Enlèvement ${data.vehicle}`, content: `Demande pour enlever: ${data.vehicle}`, receivedAt: new Date(), isRead: false, isArchived: false, status: 'pending' }); return { success: true }; };
export const submitWindshieldRequest = (data: any): { success: boolean } => { addMessageToDb({ from: "Devis Pare-brise", senderName: data.name, senderEmail: data.email, subject: `Devis pour ${data.vehicle}`, content: `Type de dommage: ${data.damageType}`, receivedAt: new Date(), isRead: false, isArchived: false, status: 'pending' }); return { success: true }; };
export const submitLiftRentalRequest = (data: any): { success: boolean } => { addMessageToDb({ from: "Location de Pont", senderName: data.name, senderEmail: data.email, subject: `Réservation pour le ${data.date}`, content: `Durée: ${data.duration}h`, receivedAt: new Date(), isRead: false, isArchived: false, status: 'pending' }); return { success: true }; };
export const submitQuoteRequest = (product: Product, quoteData: any): { success: boolean } => { addMessageToDb({ from: "Devis Pièce", senderName: quoteData.name, senderEmail: quoteData.email, subject: `Devis pour ${product.name}`, content: `Pièce: ${product.name} (Réf: ${product.oemRef})`, receivedAt: new Date(), isRead: false, isArchived: false, status: 'pending' }); return { success: true }; };

export const getAdminUsers = (): User[] => db.users;
export const getAdminMessages = (): AdminMessage[] => db.messages;
export const getBidsForUser = (userId: string): any[] => {
    return db.auctions.map(auction => {
        const userHighestBid = auction.bids.filter(bid => bid.userId === userId).sort((a, b) => b.amount - a.amount)[0];
        if (!userHighestBid) return null;
        return {
            auctionId: auction.id, vehicleName: auction.vehicle?.name || 'Véhicule', isWinning: auction.bids[0]?.userId === userId,
            userHighestBid: userHighestBid.amount, currentHighestBid: auction.currentBid, endDate: auction.endDate,
            status: new Date(auction.endDate) > new Date() ? 'active' : 'terminated'
        };
    }).filter(Boolean);
};
export const getMessagesForUser = (userEmail: string): AdminMessage[] => db.messages.filter(msg => msg.senderEmail.toLowerCase() === userEmail.toLowerCase());
export const loginUser = (email: string, password: string): User => {
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) throw new Error('Email ou mot de passe incorrect.');
    if (user.status === 'pending') throw new Error("Votre compte est en attente d'approbation.");
    return user;
};
export const registerUser = (data: any): { success: true } => {
    if (db.users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) throw new Error('Un compte avec cet email existe déjà.');
    const newUser: User = { id: `user-${Date.now()}`, name: data.name, email: data.email, role: 'Staff', status: 'pending', password: data.password };
    db.users.push(newUser);
    return { success: true };
};

// Add other functions as needed, copying logic from the provided backend files
export const approveUser = (userId: string): User => {
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    user.status = 'approved';
    return user;
};
// ... etc for all other admin and user functions
export const getBlogPosts = (): BlogPost[] => db.blog;
export const sendAdminReply = (data: any): { success: boolean } => { const msg = db.messages.find(m => m.id === data.messageId); if(msg) msg.status = 'replied'; return { success: true }; }
export const sendNewMessage = (data: any): { success: boolean } => { return { success: true }; }
export const archiveMessage = (messageId: string, isArchived: boolean): AdminMessage => { const msg = db.messages.find(m => m.id === messageId); if(msg) msg.isArchived = isArchived; return msg!; }
export const getContacts = (): Contact[] => db.contacts;
export const addContact = (contactData: Omit<Contact, 'id'>): Contact => { const newContact: Contact = {...contactData, id: `contact-${Date.now()}`}; db.contacts.unshift(newContact); return newContact; };
export const getLiftRentalBookings = (): LiftRentalBooking[] => db.bookings;
export const getAuditLogs = (): AuditLogEntry[] => db.logs;
export const updateLiftRentalBookingStatus = (bookingId: string, status: LiftRentalBooking['status']): LiftRentalBooking => { const booking = db.bookings.find(b => b.id === bookingId); if (booking) booking.status = status; return booking!; };
export const addUser = (userData: any): User => { const newUser: User = { ...userData, id: `user-${Date.now()}`, status: 'approved' }; db.users.unshift(newUser); return newUser; };
export const updateUser = (userId: string, userData: Partial<User>): User => { const index = db.users.findIndex(u => u.id === userId); if(index > -1) db.users[index] = {...db.users[index], ...userData}; return db.users[index]; };
export const deleteUser = (userId: string): { success: boolean } => { db.users = db.users.filter(u => u.id !== userId); return { success: true }; };
export const updateUserProfile = (userId: string, data: { name: string, email: string }): User => { const user = db.users.find(u => u.id === userId); if (user) { user.name = data.name; user.email = data.email; } return user!; };
export const updateUserPassword = (userId: string, data: { current: string, new: string }): { success: boolean } => { const user = db.users.find(u => u.id === userId); if (user && user.password === data.current) { user.password = data.new; return { success: true }; } throw new Error("Current password incorrect"); };
