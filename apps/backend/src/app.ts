import express from 'express';
import cookieParser from 'cookie-parser';
import { helmetConfig, corsConfig } from './config/security';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth.routes';
import contactRoutes from './routes/contact.routes';

const app = express();

// Configuración de Proxy para leer X-Forwarded-For correctamente detrás de proxies
app.set('trust proxy', 1);

// Middlewares globales de seguridad
app.use(helmetConfig);
app.use(corsConfig);
app.use(express.json());
app.use(cookieParser());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);

// Manejador de errores
app.use(errorHandler);

export default app;