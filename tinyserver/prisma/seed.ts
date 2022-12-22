import { PrismaClient } from '../generated/client/deno/edge.ts';
import { Prisma } from '../generated/client/deno/edge.ts';

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  // user: admin@example.com
  // pass: MyNameIsAdmin.
  {
    email: 'admin@example.com',
    id: 'admin',
    is_email_confirmed: true,
    role: 'ADMIN',
    max_capacity: 10485760,
    file_usage: 0,
    encryption_data: JSON.stringify({
      client_random_value: 'pHzUQIIyKNqXylNe4huAWA==',
      encrypted_master_key: '4Uul0HgyTXt2hBMI+ceAyQ==',
      encrypted_master_key_iv: 'gYOzUPc1tdkP6toSUFKTwQ==',
      hashed_authentication_key: 'bTebDNGn+ysNDZ0LZWt9SLFzFWlKCG9Co0sbZ/AmlmA=',
    }),
    rsa_public_key: '',
  },
  // user: testuser+ddd@example.com
  // pass: MyNameIsTestUser.
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
  // user: baduser+ddd@example.com
  // pass: MyNameIsTestUser.
  ...[...Array(20)].map((_, i): Prisma.UserCreateInput => (
    {
      email: `baduser+${i.toString().padStart(3, '0')}@example.com`,
      id: `baduser${i.toString().padStart(3, '0')}`,
      is_email_confirmed: false,
      role: 'USER',
      max_capacity: 10485760,
      file_usage: 0,
      encryption_data: JSON.stringify({
        client_random_value: 'OzN38sFE2X1LSi0BibW8nw==',
        encrypted_master_key: 'DtIqXDtlUH7VWdTSoJAo6g==',
        encrypted_master_key_iv: 'zLw6WwbqPir2gPwtzNUdMQ==',
        hashed_authentication_key: 'p9dJ8Fc5clRV86T5iUaPTtyW4V/VJF9sIxWIHNeSglw=',
      }),
      rsa_public_key: '',
    }
  )),
];

try {
  console.log('◭Delete...');

  await prisma.user.deleteMany({});

  console.log('◭seeding...');

  console.log('- Users');
  await prisma.user.createMany({
    data: userData,
  });

  console.log('◭Seeding finished!');
} catch (e) {
  console.error(e);
} finally {
  await prisma.$disconnect();
}
