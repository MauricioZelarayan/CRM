import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string({ message: 'DATABASE_URL es obligatoria' }).url(),
  JWT_SECRET: z.string({ message: 'JWT_SECRET es obligatoria' }).min(32, 'Debe tener al menos 32 caracteres'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  TURNSTILE_SECRET_KEY: z.string().default('1x0000000000000000000000000000000AA'), // Secret key dummy de Cloudflare para testing
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Error crítico en variables de entorno:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;