import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: 'Admin Expert', email: 'admin@expert.fr', role: 'Admin' as const, status: 'approved' as const, password: 'password123' },
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

  // eslint-disable-next-line no-console
  console.log('Seed completed');
}

main().finally(async () => {
  await prisma.$disconnect();
});
