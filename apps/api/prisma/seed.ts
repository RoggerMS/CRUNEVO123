import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@crunevo.local';
  const password = 'Admin123!';
  const passwordHash = await argon2.hash(password);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      username: 'admin',
      passwordHash,
      role: Role.ADMIN,
      teacherVerified: true,
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
