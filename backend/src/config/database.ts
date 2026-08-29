import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL no esta definida en el .env');
}

// FIX IMPORTANTE: PrismaPg espera un Pool de pg, NO un objeto con connectionString.
// Antes: new PrismaPg({ connectionString })  <- ESO ESTABA MAL
// Ahora: new pg.Pool({ connectionString }) -> new PrismaPg(pool)
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export const testDbConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conexion a la base de datos con Prisma exitosa');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1); // Matamos el proceso para que Docker/PM2 lo reinicie
  }
};
