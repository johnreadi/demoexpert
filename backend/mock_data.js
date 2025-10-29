const PartCategory = {
  MECANIQUE: 'Mécanique',
  ELECTRICITE: 'Électricité',
  CARROSSERIE: 'Carrosserie',
  AUTRE: 'Autre'
};

const MOCK_SITE_SETTINGS = {
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

const MOCK_PRODUCTS = Array.from({ length: 50 }, (_, i) => ({
    id: `prod-${i + 1}`, name: `Alternateur ${['Renault', 'Peugeot', 'Citroën'][i%3]} ${['Clio', '208', 'C3'][i%3]}`,
    oemRef: `REF${8200660035 + i}`, brand: ['Renault', 'Peugeot', 'Citroën'][i%3], model: ['Clio', '208', 'C3'][i%3],
    year: 2015 + (i % 8), category: Object.values(PartCategory)[i % 3], price: 50 + (i * 5) % 150,
    condition: i % 3 === 0 ? 'Bon état' : 'Occasion', warranty: '3 mois', compatibility: `Modèle Phase ${i%2 + 1}`,
    images: [`https://picsum.photos/seed/prod${i+1}/400/300`], description: `Pièce d'occasion en excellent état.`,
}));

const MOCK_USERS = [
    { id: 'user-admin-1', name: 'Admin Expert', email: 'admin@expert.fr', role: 'Admin', status: 'approved', password: 'password123' },
    { id: 'user-staff-1', name: 'Jean Dupont', email: 'jean.dupont@expert.fr', role: 'Staff', status: 'approved', password: 'password123' },
    { id: 'user-staff-2', name: 'Marie Curie', email: 'marie.curie@expert.fr', role: 'Staff', status: 'pending', password: 'password123' },
];

const MOCK_AUCTIONS = [
    { id: 'auc-1', vehicle: { name: 'Peugeot 208 GT Line', brand: 'Peugeot', model: '208', year: 2019, mileage: 55000, description: 'Superbe Peugeot 208 GT Line...', images: ['https://picsum.photos/seed/auc1-1/800/600'] }, startingPrice: 8000, currentBid: 8300, bidCount: 6, bids: [ { userId: 'user-staff-2', bidderName: 'Marie Curie', amount: 8300, timestamp: new Date(Date.now() - 3600000 * 1).toISOString() } ], endDate: new Date(Date.now() + 1000 * 60 * 60 * 49).toISOString() },
    { id: 'auc-2', vehicle: { name: 'Volkswagen Golf VII', brand: 'Volkswagen', model: 'Golf', year: 2017, mileage: 89000, description: 'Volkswagen Golf 7 en excellent état...', images: ['https://picsum.photos/seed/auc2-1/800/600'] }, startingPrice: 10000, currentBid: 10500, bidCount: 8, bids: [ { userId: 'user-staff-1', bidderName: 'Jean Dupont', amount: 10500, timestamp: new Date(Date.now() - 3600000 * 1).toISOString() } ], endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString() },
];

const MOCK_ADMIN_MESSAGES = [
    { id: 'msg-1', from: 'Formulaire d\'enlèvement', senderName: 'Paul Martin', senderEmail: 'paul.martin@email.com', subject: 'Demande enlèvement Clio 2', content: 'Bonjour, je souhaiterais faire enlever ma Renault Clio 2.', receivedAt: new Date(Date.now() - 3600000 * 2).toISOString(), isRead: false, isArchived: false, status: 'pending' },
    { id: 'msg-2', from: 'Formulaire de Contact', senderName: 'Marie Curie', senderEmail: 'marie.curie@expert.fr', subject: 'Question sur une pièce', content: 'Bonjour, avez-vous un alternateur pour une Peugeot 308 ?', receivedAt: new Date(Date.now() - 3600000 * 24).toISOString(), isRead: true, isArchived: false, status: 'replied' },
];

module.exports = {
    PartCategory,
    MOCK_SITE_SETTINGS,
    MOCK_PRODUCTS,
    MOCK_USERS,
    MOCK_AUCTIONS,
    MOCK_ADMIN_MESSAGES
};
