import { defineConfig, env } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  // TypeScript te pide un string con la ruta al archivo
  schema: 'prisma/schema.prisma',
  migrations: {
    // Le decimos a Prisma 7 que ejecute nuestro archivo usando ts-node
    seed: 'npx ts-node ./prisma/seed.ts', 
  },
  // TypeScript te pide un string directo con la URL (la saca de process.env)
  datasource: {
    url: env('DATABASE_URL'),
  }
});