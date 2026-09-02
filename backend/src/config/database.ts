import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL no esta definida en el .env');
}



const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export const testDbConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conexion a la base de datos con Prisma exitosa, buena suerte');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos, revisa el .env:', error);
    process.exit(1); 
  }
};
