import bcrypt from 'bcryptjs';
import { PrismaClient, Role, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: 'Admin Expert', email: 'admin@expert.fr', role: Role.Admin, status: Status.approved, password: 'password123' },
    { name: 'Jean Dupont', email: 'jean.dupont@expert.fr', role: Role.Staff, status: Status.approved, password: 'password123' },
    { name: 'Marie Curie', email: 'marie.curie@expert.fr', role: Role.Staff, status: Status.pending, password: 'password123' },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      update: { name: u.name, role: u.role, status: u.status, password: passwordHash },
      create: { name: u.name, email: u.email.toLowerCase(), role: u.role, status: u.status, password: passwordHash },
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed completed');
}

main().finally(async () => {
  await prisma.$disconnect();
});
