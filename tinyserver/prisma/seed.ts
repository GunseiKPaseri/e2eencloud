import { PrismaClient } from '../generated/client/deno/edge.ts';
import type { Prisma } from '../generated/client/deno/edge.ts';

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    email: 'admin@example.com',
    id: 'admin',
    is_email_confirmed: true,
    role: 'ADMIN',
    max_capacity: 10485760,
    file_usage: 0,
    encryption_data: '{}',
    rsa_public_key: '',
  },
  ...[...Array(100)].map((_, i): Prisma.UserCreateInput => (
    {
      email: `testuser+${i.toString().padStart(3, '0')}@example.com`,
      id: `testuser${i.toString().padStart(3, '0')}`,
      is_email_confirmed: true,
      role: 'USER',
      max_capacity: 10485760,
      file_usage: 0,
      encryption_data: '{}',
      rsa_public_key: '',
    }
  )),
  ...[...Array(20)].map((_, i): Prisma.UserCreateInput => (
    {
      email: `baduser+${i.toString().padStart(3, '0')}@example.com`,
      id: `baduser${i.toString().padStart(3, '0')}`,
      is_email_confirmed: false,
      role: 'USER',
      max_capacity: 10485760,
      file_usage: 0,
      encryption_data: '{}',
      rsa_public_key: '',
    }
  )),
];

try {
  console.log('◭Start seeding...');

  console.log('- Users');
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }

  console.log('◭Seeding finished!');
} catch (e) {
  console.error(e);
} finally {
  await prisma.$disconnect();
}
