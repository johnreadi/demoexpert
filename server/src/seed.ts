import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: 'Admin Expert', email: 'admin@expert.fr', role: 'Admin' as const, status: 'approved' as const, password: 'password123' },
    { name: 'Admin Demoexpert', email: 'admin@demoexpert.fr', role: 'Admin' as const, status: 'approved' as const, password: 'demolition76000' },
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

  // Seed demo products (id auto)
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

  // Seed demo auctions with bids
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
    // find user ids from email
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

  // eslint-disable-next-line no-console
  console.log('Seed completed');
}

main().finally(async () => {
  await prisma.$disconnect();
});
