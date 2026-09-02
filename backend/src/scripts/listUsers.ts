//pnpm tsx src/scripts/listUsers.ts
import 'dotenv/config';
import { prisma } from '../config/database.js';

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
  console.table(users);
}

main().finally(() => prisma.$disconnect());