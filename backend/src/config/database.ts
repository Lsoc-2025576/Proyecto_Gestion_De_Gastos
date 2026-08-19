import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Imprimimos el valor exacto que Node.js está leyendo del .env
console.log('🔍 VALOR LEÍDO DE DATABASE_URL:', process.env.DATABASE_URL);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL no está definida en el .env');
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });

export const testDbConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos con Prisma exitosa');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
  }
};