import { type Prisma, prisma } from '../dbclient.ts'

const userData: Prisma.UserCreateInput[] = [
  // user: admin@example.com
  // pass: MyNameIsAdmin.
  {
    id: crypto.randomUUID(),
    email: 'admin@example.com',
    is_email_confirmed: true,
    role: 'ADMIN',
    max_capacity: 5242880,
    file_usage: 0,
    client_random_value: '88lXar7xkN+Ug4ICLBh+ag==',
    encrypted_master_key: '1x1bXZHGOc5nnfEa2F6tHA==',
    encrypted_master_key_iv: 'Wrb6TwXyrX+QZVuNCtN5CA==',
    encrypted_rsa_private_key: '',
    encrypted_rsa_private_key_iv: '',
    hashed_authentication_key: '6SJfJ9eK8LzLoo1HpN3usZa7kvTdijMLyz7PFfbWjpI=',
    rsa_public_key: '',
  },
  // user: testuser+ddd@example.com
  // pass: MyNameIsTestUser.
  ...[...Array(100)].map((_, i): Prisma.UserCreateInput => (
    {
      email: `testuser+${i.toString().padStart(3, '0')}@example.com`,
      id: crypto.randomUUID(),
      is_email_confirmed: true,
      role: 'USER',
      max_capacity: 5242880,
      file_usage: 0,
      client_random_value: 'Let8T41srNCj2cuF3I0ayw==',
      encrypted_master_key: '4ocp1+LV0DkjbrgmecIKbw==',
      encrypted_master_key_iv: 'RtH3NQAwY29xm3RUYqOy0Q==',
      encrypted_rsa_private_key: '',
      encrypted_rsa_private_key_iv: '',
      hashed_authentication_key: 'UucYhXFqWuZ/+9kiNQWdoe0TyK1ijC3U9ZqpBLwBsLc=',
      rsa_public_key: '',
    }
  )),
  // user: baduser+ddd@example.com
  // pass: MyNameIsTestUser.
  ...[...Array(20)].map((_, i): Prisma.UserCreateInput => (
    {
      email: `baduser+${i.toString().padStart(3, '0')}@example.com`,
      id: crypto.randomUUID(),
      is_email_confirmed: false,
      role: 'USER',
      max_capacity: 10485760,
      file_usage: 0,
      client_random_value: '',
      encrypted_master_key: '',
      encrypted_master_key_iv: '',
      encrypted_rsa_private_key: '',
      encrypted_rsa_private_key_iv: '',
      hashed_authentication_key: '',
      rsa_public_key: '',
    }
  )),
]

try {
  console.log('◭Delete...')

  await prisma.user.deleteMany({})

  console.log('◭seeding...')

  console.log('- Users')
  await prisma.user.createMany({
    data: userData,
  })

  console.log('◭Seeding finished!')
} catch (e) {
  console.error(e)
} finally {
  await prisma.$disconnect()
}
