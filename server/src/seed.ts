import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: 'Admin Expert', email: 'admin@expert.fr', role: 'Admin' as const, status: 'approved' as const, password: 'demo76000' },
    { name: 'Admin Demoexpert', email: 'admin@demoexpert.fr', role: 'Admin' as const, status: 'approved' as const, password: 'demo76000' },
    { name: 'Jean Dupont', email: 'jean.dupont@expert.fr', role: 'Staff' as const, status: 'approved' as const, password: 'password123' },
    { name: 'Marie Curie', email: 'marie.curie@expert.fr', role: 'Staff' as const, status: 'pending' as const, password: 'password123' },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      update: { name: u.name, role: u.role, status: u.status, password: passwordHash },
      create: { name: u.name, email: u.email.toLowerCase(), role: u.role, status: u.status, password: passwordHash },
    });
  }

  await prisma.settings.upsert({
    where: { key: 'site_settings' },
    update: { value: {
      businessInfo: { name: 'Démolition Expert', logoUrl: '', address: '450 Route de Gournay, 76160 Saint-Jacques-sur-Darnétal, France', phone: '02 35 08 18 55', email: 'contact@casseautopro.fr', openingHours: 'Lun-Ven: 8h00 - 18h00, Sam: 9h00 - 12h00' },
      socialLinks: { facebook: 'https://facebook.com', twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' },
      themeColors: { headerBg: '#003366', footerBg: '#003366' },
      hero: { title: "Pièces d'occasion de qualité", subtitle: "Économisez jusqu'à 80% et recyclez !", background: { type: 'image', value: 'https://picsum.photos/seed/hero/1920/1080' } },
      services: [
        { id: 'serv-1', icon: 'fas fa-cogs', title: 'Vente de Pièces', description: "Un large inventaire de pièces détachées d'occasion, testées et garanties.", link: '/pieces' },
        { id: 'serv-2', icon: 'fas fa-car', title: 'Rachat de Véhicules', description: "Nous rachetons votre véhicule hors d'usage au meilleur prix du marché.", link: '/rachat-vehicule' },
        { id: 'serv-3', icon: 'fas fa-truck-pickup', title: "Enlèvement d'Épave", description: "Service d'enlèvement d'épave gratuit en Normandie. Simple et rapide.", link: '/enlevement-epave' },
        { id: 'serv-4', icon: 'fas fa-shield-halved', title: 'Pare-brise', description: "Réparation d'impacts et remplacement. Service rapide et garanti.", link: '/pare-brise' },
        { id: 'serv-5', icon: 'fas fa-tools', title: 'Location de Pont', description: 'Louez un de nos ponts élévateurs pour faire votre mécanique.', link: '/location-pont' },
        { id: 'serv-6', icon: 'fas fa-wrench', title: 'Réparation & Entretien', description: 'Diagnostic, réparation et entretien toutes marques.', link: '/entretien' }
      ],
      testimonials: [
        { id: 'test-1', text: "Service rapide et pièce conforme. J'ai économisé une fortune sur la réparation de ma Clio. Je recommande !!", author: 'Julien D., Rouen' },
        { id: 'test-2', text: "Enlèvement de mon épave en 48h, tout s'est très bien passé. Équipe très professionnelle.", author: 'Sylvie M., Le Havre' },
        { id: 'test-3', text: "J'ai trouvé un alternateur pour ma 308 que je ne trouvais nulle part ailleurs. Merci Démolition Expert !", author: 'Garage Martin' }
      ],
      footer: { description: "Votre spécialiste de la pièce automobile d'occasion et du recyclage en Normandie.", servicesLinks: [ { id: 'fsl-1', text: 'Pièces Détachées', url: '/pieces' }, { id: 'fsl-2', text: 'Rachat de Véhicules', url: '/rachat-vehicule' }, { id: 'fsl-3', text: "Enlèvement d'Épaves", url: '/enlevement-epave' }, { id: 'fsl-4', text: 'Réparation', url: '/reparation' } ], infoLinks: [ { id: 'fil-1', text: 'Contact', url: '/contact' }, { id: 'fil-3', text: 'CGV', url: '/cgv' }, { id: 'fil-4', text: 'Mentions Légales', url: '/mentions-legales' } ] },
      legal: { mentions: { title: 'Mentions Légales', content: '' }, cgv: { title: 'Conditions Générales de Vente', content: '' }, confidentialite: { title: 'Politique de Confidentialité', content: '' } },
      liftRental: { pricingTiers: [ { duration: 1, price: 50 }, { duration: 2, price: 90 }, { duration: 4, price: 160 } ], unavailableDates: ['2025-12-25', '2026-01-01'] },
      pageContent: { repairs: { heroTitle: 'Réparation & Maintenance', heroSubtitle: 'Diagnostic précis et réparations fiables.', heroImage: 'https://picsum.photos/seed/mechanic-repair/1920/1080', contentTitle: 'Un service expert', contentDescription: "Notre équipe est équipée pour diagnostiquer et résoudre tous types de problèmes.", contentImage: 'https://picsum.photos/seed/diagnostic-tool/800/600', features: [ '<strong>Diagnostic électronique complet</strong>', '<strong>Réparation moteur</strong>', '<strong>Système de freinage</strong>' ] }, maintenance: { heroTitle: 'Vidange & Entretien', heroSubtitle: 'Assurez la longévité de votre moteur.', heroImage: 'https://picsum.photos/seed/oil-change/1920/1080', contentTitle: "L'entretien, clé de la fiabilité", contentDescription: 'Nous proposons des forfaits d\'entretien complets adaptés.', contentImage: 'https://picsum.photos/seed/car-filters/800/600', features: [ '<strong>Vidange huile moteur</strong>', '<strong>Remplacement des filtres</strong>', '<strong>Contrôle des points de sécurité</strong>' ] }, tires: { heroTitle: 'Service Pneus', heroSubtitle: 'Vente, montage et équilibrage.', heroImage: 'https://picsum.photos/seed/tire-fitting/1920/1080', contentTitle: 'Votre sécurité, notre priorité', contentDescription: "Nous proposons une large gamme de pneus neufs et d'occasion.", contentImage: 'https://picsum.photos/seed/wheel-balancing/800/600', features: [ '<strong>Vente de pneus neufs et d\'occasion</strong>', '<strong>Montage et équilibrage</strong>', '<strong>Réparation de crevaison</strong>' ] } },
      advancedSettings: { smtp: { host: 'smtp.example.com', port: 587, user: 'user@example.com', pass: '' }, ai: { chatModel: 'gemini-2.5-flash', estimationModel: 'gemini-2.5-flash' }, seo: { metaTitle: 'Démolition Expert', metaDescription: "Pièces auto d'occasion garanties.", keywords: 'casse auto, pièces occasion' }, security: { allowPublicRegistration: true } }
    } },
    create: { key: 'site_settings', value: { businessInfo: { name: 'Démolition Expert', logoUrl: '', address: '450 Route de Gournay, 76160 Saint-Jacques-sur-Darnétal, France', phone: '02 35 08 18 55', email: 'contact@casseautopro.fr', openingHours: 'Lun-Ven: 8h00 - 18h00, Sam: 9h00 - 12h00' }, socialLinks: { facebook: 'https://facebook.com', twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' }, themeColors: { headerBg: '#003366', footerBg: '#003366' }, hero: { title: "Pièces d'occasion de qualité", subtitle: "Économisez jusqu'à 80% et recyclez !", background: { type: 'image', value: 'https://picsum.photos/seed/hero/1920/1080' } }, services: [ { id: 'serv-1', icon: 'fas fa-cogs', title: 'Vente de Pièces', description: "Un large inventaire de pièces détachées d'occasion, testées et garanties.", link: '/pieces' }, { id: 'serv-2', icon: 'fas fa-car', title: 'Rachat de Véhicules', description: "Nous rachetons votre véhicule hors d'usage au meilleur prix du marché.", link: '/rachat-vehicule' }, { id: 'serv-3', icon: 'fas fa-truck-pickup', title: "Enlèvement d'Épave", description: "Service d'enlèvement d'épave gratuit en Normandie. Simple et rapide.", link: '/enlevement-epave' }, { id: 'serv-4', icon: 'fas fa-shield-halved', title: 'Pare-brise', description: "Réparation d'impacts et remplacement. Service rapide et garanti.", link: '/pare-brise' }, { id: 'serv-5', icon: 'fas fa-tools', title: 'Location de Pont', description: 'Louez un de nos ponts élévateurs pour faire votre mécanique.', link: '/location-pont' }, { id: 'serv-6', icon: 'fas fa-wrench', title: 'Réparation & Entretien', description: 'Diagnostic, réparation et entretien toutes marques.', link: '/entretien' } ], testimonials: [ { id: 'test-1', text: "Service rapide et pièce conforme. J'ai économisé une fortune sur la réparation de ma Clio. Je recommande !!", author: 'Julien D., Rouen' }, { id: 'test-2', text: "Enlèvement de mon épave en 48h, tout s'est très bien passé. Équipe très professionnelle.", author: 'Sylvie M., Le Havre' }, { id: 'test-3', text: "J'ai trouvé un alternateur pour ma 308 que je ne trouvais nulle part ailleurs. Merci Démolition Expert !", author: 'Garage Martin' } ], footer: { description: "Votre spécialiste de la pièce automobile d'occasion et du recyclage en Normandie.", servicesLinks: [ { id: 'fsl-1', text: 'Pièces Détachées', url: '/pieces' }, { id: 'fsl-2', text: 'Rachat de Véhicules', url: '/rachat-vehicule' }, { id: 'fsl-3', text: "Enlèvement d'Épaves", url: '/enlevement-epave' }, { id: 'fsl-4', text: 'Réparation', url: '/reparation' } ], infoLinks: [ { id: 'fil-1', text: 'Contact', url: '/contact' }, { id: 'fil-3', text: 'CGV', url: '/cgv' }, { id: 'fil-4', text: 'Mentions Légales', url: '/mentions-legales' } ] }, legal: { mentions: { title: 'Mentions Légales', content: '' }, cgv: { title: 'Conditions Générales de Vente', content: '' }, confidentialite: { title: 'Politique de Confidentialité', content: '' } }, liftRental: { pricingTiers: [ { duration: 1, price: 50 }, { duration: 2, price: 90 }, { duration: 4, price: 160 } ], unavailableDates: ['2025-12-25', '2026-01-01'] }, pageContent: { repairs: { heroTitle: 'Réparation & Maintenance', heroSubtitle: 'Diagnostic précis et réparations fiables.', heroImage: 'https://picsum.photos/seed/mechanic-repair/1920/1080', contentTitle: 'Un service expert', contentDescription: "Notre équipe est équipée pour diagnostiquer et résoudre tous types de problèmes.", contentImage: 'https://picsum.photos/seed/diagnostic-tool/800/600', features: [ '<strong>Diagnostic électronique complet</strong>', '<strong>Réparation moteur</strong>', '<strong>Système de freinage</strong>' ] }, maintenance: { heroTitle: 'Vidange & Entretien', heroSubtitle: 'Assurez la longévité de votre moteur.', heroImage: 'https://picsum.photos/seed/oil-change/1920/1080', contentTitle: "L'entretien, clé de la fiabilité", contentDescription: 'Nous proposons des forfaits d\'entretien complets adaptés.', contentImage: 'https://picsum.photos/seed/car-filters/800/600', features: [ '<strong>Vidange huile moteur</strong>', '<strong>Remplacement des filtres</strong>', '<strong>Contrôle des points de sécurité</strong>' ] }, tires: { heroTitle: 'Service Pneus', heroSubtitle: 'Vente, montage et équilibrage.', heroImage: 'https://picsum.photos/seed/tire-fitting/1920/1080', contentTitle: 'Votre sécurité, notre priorité', contentDescription: "Nous proposons une large gamme de pneus neufs et d'occasion.", contentImage: 'https://picsum.photos/seed/wheel-balancing/800/600', features: [ '<strong>Vente de pneus neufs et d\'occasion</strong>', '<strong>Montage et équilibrage</strong>', '<strong>Réparation de crevaison</strong>' ] } }, advancedSettings: { smtp: { host: 'smtp.example.com', port: 587, user: 'user@example.com', pass: '' }, ai: { chatModel: 'gemini-2.5-flash', estimationModel: 'gemini-2.5-flash' }, seo: { metaTitle: 'Démolition Expert', metaDescription: "Pièces auto d'occasion garanties.", keywords: 'casse auto, pièces occasion' }, security: { allowPublicRegistration: true } } } })

  const demoProducts = [
    {
      name: "Alternateur Renault Clio",
      oemRef: "REF8200660035",
      brand: "Renault",
      model: "Clio",
      year: 2018,
      category: "Alternateur",
      price: "95.00",
      condition: "Occasion",
      warranty: "3 mois",
      compatibility: "Clio IV",
      images: ["https://picsum.photos/seed/prod1/400/300"],
      description: "Alternateur testé et garanti.",
    },
    {
      name: "Démarreur Peugeot 208",
      oemRef: "REF9801234567",
      brand: "Peugeot",
      model: "208",
      year: 2019,
      category: "Démarreur",
      price: "120.00",
      condition: "Bon état",
      warranty: "3 mois",
      compatibility: "208 phase 2",
      images: ["https://picsum.photos/seed/prod2/400/300"],
      description: "Démarreur en très bon état.",
    },
  ];
  for (const p of demoProducts) {
    await prisma.product.upsert({
      where: { oemRef: p.oemRef },
      update: p,
      create: p,
    });
  }

  const demoAuctions = [
    {
      vehicleName: 'Peugeot 208 GT Line',
      brand: 'Peugeot',
      model: '208',
      year: 2019,
      mileage: 55000,
      description: 'Superbe Peugeot 208 GT Line...',
      images: ['https://picsum.photos/seed/auc1-1/800/600'],
      startingPrice: '8000.00',
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
      bids: [
        { bidderName: 'Marie Curie', userEmail: 'marie.curie@expert.fr', amount: '8300.00' }
      ]
    },
    {
      vehicleName: 'Volkswagen Golf VII',
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2017,
      mileage: 89000,
      description: 'Volkswagen Golf 7 en excellent état...',
      images: ['https://picsum.photos/seed/auc2-1/800/600'],
      startingPrice: '10000.00',
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      bids: [
        { bidderName: 'Jean Dupont', userEmail: 'jean.dupont@expert.fr', amount: '10500.00' }
      ]
    }
  ];

  for (const a of demoAuctions) {
    const userByEmail = async (email: string) => {
      const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      return u?.id || 'user-unknown';
    };

    const created = await prisma.auction.create({
      data: {
        vehicleName: a.vehicleName,
        brand: a.brand,
        model: a.model,
        year: a.year,
        mileage: a.mileage,
        description: a.description,
        images: a.images,
        startingPrice: a.startingPrice,
        currentBid: a.startingPrice,
        bidCount: 0,
        endDate: a.endDate,
      }
    });

    for (const b of a.bids) {
      const uid = await userByEmail(b.userEmail);
      await prisma.bid.create({ data: { auctionId: created.id, userId: uid, bidderName: b.bidderName, amount: b.amount } });
      await prisma.auction.update({ where: { id: created.id }, data: { currentBid: b.amount, bidCount: { increment: 1 } } });
    }
  }

  console.log('Seed completed');
}

main().finally(async () => {
  await prisma.$disconnect();
});
