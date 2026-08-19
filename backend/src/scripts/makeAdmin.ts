import 'dotenv/config';
import { prisma } from '../config/database.js';

const email = 'ejemplo@gmail.com';

async function main() {
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });
  console.log('Usuario actualizado:', user);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());