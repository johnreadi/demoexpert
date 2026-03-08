import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_SETTINGS = {
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
    mentions: { title: "Mentions Légales", content: "" },
    cgv: { title: "Conditions Générales de Vente", content: "" },
    confidentialite: { title: "Politique de Confidentialité", content: "" },
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

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Settings
  console.log('📝 Creating site settings...');
  await prisma.settings.upsert({
    where: { key: 'site_settings' },
    update: { value: DEFAULT_SETTINGS },
    create: { key: 'site_settings', value: DEFAULT_SETTINGS }
  });
  console.log('✅ Settings created');

  // 2. Create Users
  console.log('👥 Creating users...');
  const adminRawPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'password123';
  const adminPassword = await bcrypt.hash(adminRawPassword, 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demoexpert.fr' },
    update: { password: adminPassword },
    create: {
      name: 'Admin Expert',
      email: 'admin@demoexpert.fr',
      role: 'Admin',
      status: 'approved',
      password: adminPassword,
    }
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@demoexpert.fr' },
    update: {},
    create: {
      name: 'Jean Dupont',
      email: 'staff@demoexpert.fr',
      role: 'Staff',
      status: 'approved',
      password: adminPassword,
    }
  });

  console.log(`✅ Users created: admin@demoexpert.fr, staff@demoexpert.fr (password: ${adminRawPassword})`);

  // 3. Create Products
  console.log('🔧 Creating products...');
  const brands = ['Renault', 'Peugeot', 'Citroën', 'Volkswagen', 'Ford'];
  const models = ['Clio', '208', 'C3', 'Golf', 'Fiesta'];
  const categories = ['Moteur', 'Transmission', 'Électrique'];
  
  const productPromises = Array.from({ length: 50 }, (_, i) => {
    const brand = brands[i % brands.length];
    const model = models[i % models.length];
    const category = categories[i % categories.length];
    
    return prisma.product.create({
      data: {
        name: `Alternateur ${brand} ${model}`,
        oemRef: `REF${820066003 + i}`,
        brand,
        model,
        year: 2015 + (i % 8),
        category,
        price: 50 + (i * 5) % 150,
        condition: i % 3 === 0 ? 'Bon état' : 'Occasion',
        warranty: '3 mois',
        compatibility: `Modèle Phase ${i % 2 + 1}`,
        images: [`https://picsum.photos/seed/prod${i+1}/400/300`],
        description: `Pièce d'occasion en excellent état, testée et garantie.`,
      }
    });
  });

  await Promise.all(productPromises);
  console.log('✅ 50 products created');

  // 4. Create Auctions
  console.log('🚗 Creating auctions...');
  
  const auction1 = await prisma.auction.create({
    data: {
      vehicleName: 'Peugeot 208 GT Line',
      brand: 'Peugeot',
      model: '208',
      year: 2019,
      mileage: 55000,
      description: 'Superbe Peugeot 208 GT Line en excellent état. Entretien régulier, carnet complet.',
      images: ['https://picsum.photos/seed/auc1/800/600'],
      startingPrice: 8000,
      currentBid: 8300,
      bidCount: 3,
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 49), // Dans 2 jours
    }
  });

  await prisma.bid.create({
    data: {
      auctionId: auction1.id,
      userId: staff.id,
      bidderName: staff.name,
      amount: 8300,
    }
  });

  const auction2 = await prisma.auction.create({
    data: {
      vehicleName: 'Volkswagen Golf VII',
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2017,
      mileage: 89000,
      description: 'Volkswagen Golf 7 en excellent état, version TDI économique.',
      images: ['https://picsum.photos/seed/auc2/800/600'],
      startingPrice: 10000,
      currentBid: 10500,
      bidCount: 5,
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // Dans 5 jours
    }
  });

  await prisma.bid.create({
    data: {
      auctionId: auction2.id,
      userId: admin.id,
      bidderName: admin.name,
      amount: 10500,
    }
  });

  console.log('✅ 2 auctions created with bids');

  // 5. Create Admin Messages
  console.log('📧 Creating admin messages...');
  
  await prisma.adminMessage.createMany({
    data: [
      {
        from: "Formulaire d'enlèvement",
        senderName: 'Paul Martin',
        senderEmail: 'paul.martin@email.com',
        subject: 'Demande enlèvement Clio 2',
        content: 'Bonjour, je souhaiterais faire enlever ma Renault Clio 2 qui ne fonctionne plus.',
        isRead: false,
        isArchived: false,
        status: 'pending'
      },
      {
        from: 'Formulaire de Contact',
        senderName: 'Marie Curie',
        senderEmail: 'marie.curie@example.fr',
        subject: 'Question sur une pièce',
        content: 'Bonjour, avez-vous un alternateur pour une Peugeot 308 de 2016 ?',
        isRead: true,
        isArchived: false,
        status: 'replied'
      }
    ]
  });

  console.log('✅ 2 admin messages created');

  // 6. Create Contacts
  console.log('📬 Creating contacts...');
  
  await prisma.contact.createMany({
    data: [
      {
        name: 'Sophie Dubois',
        email: 'sophie.dubois@example.fr',
        subject: 'Demande de devis',
        message: 'Bonjour, je souhaiterais obtenir un devis pour des pièces de carrosserie.'
      },
      {
        name: 'Lucas Martin',
        email: 'lucas.martin@example.fr',
        subject: 'Horaires d\'ouverture',
        message: 'Bonjour, êtes-vous ouverts le samedi après-midi ?'
      }
    ]
  });

  console.log('✅ 2 contacts created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log('   - 2 users (admin@demoexpert.fr, staff@demoexpert.fr)');
  console.log('   - 50 products');
  console.log('   - 2 auctions with bids');
  console.log('   - 2 admin messages');
  console.log('   - 2 contacts');
  console.log('   - Site settings configured');
  console.log('\n🔑 Login credentials:');
  console.log('   Email: admin@demoexpert.fr');
  console.log('   Password: password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
