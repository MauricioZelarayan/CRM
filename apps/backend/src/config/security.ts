import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export const helmetConfig = helmet();

export const corsConfig = cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // Envío seguro de cookies HttpOnly
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Limitador exclusivo para Inicio de Sesión (Previene fuerza bruta contra credenciales)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Límite de 10 intentos por IP
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador exclusivo para Registro (Previene spam de creación de cuentas/organizaciones)
export const registerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Límite de 10 intentos por IP
  message: { error: 'Demasiados intentos de registro. Intenta de nuevo más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});