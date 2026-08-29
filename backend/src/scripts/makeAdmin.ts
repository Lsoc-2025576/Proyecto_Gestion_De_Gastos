import 'dotenv/config';
import { prisma } from '../config/database.js';

const email = process.argv[2];

if (!email) {
  console.error('Uso: pnpm tsx src/scripts/makeAdmin.ts <email>');
  process.exit(1);
}

async function main() {
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }, // Ahora Prisma valida que sea 'ADMIN' o 'CLIENTE'
  });
  console.log('✅ Usuario actualizado a ADMIN:', user.email);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
