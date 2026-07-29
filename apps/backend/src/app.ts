import express from 'express';
import cookieParser from 'cookie-parser';
import { helmetConfig, corsConfig } from './config/security';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth.routes';
import contactRoutes from './routes/contact.routes';

const app = express();

app.use(helmetConfig);
app.use(corsConfig);
app.use(express.json());
app.use(cookieParser());

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);

// Manejador central de errores
app.use(errorHandler);

export default app;