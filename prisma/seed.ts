import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      displayName: 'Test User',
      birthYear: 1990,
      hrMax: 190
    }
  });

  console.log('Seeded test user:', user.id);

  // Create demo session
  const session = await prisma.session.upsert({
    where: { id: 'demo-session' },
    update: {},
    create: {
      id: 'demo-session',
      hostUserId: user.id,
      youtubeVideoId: 'dQw4w9WgXcQ',
      title: 'Demo Training Session',
      status: 'waiting'
    }
  });

  console.log('Seeded demo session:', session.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
