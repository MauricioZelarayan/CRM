import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno.');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Instancia única (Singleton) con soporte para Prisma 7 Driver Adapters
export const prisma = new PrismaClient({ adapter });