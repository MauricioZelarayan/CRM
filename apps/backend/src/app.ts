import './config/env'; // Validación temprana de Zod env (Fail-Fast)
import express from 'express';
import cookieParser from 'cookie-parser';
import { helmetConfig, corsConfig } from './config/security';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth.routes';
import contactRoutes from './routes/contact.routes';
import dealRoutes from './routes/deal.routes';
import activityRoutes from './routes/activity.routes';
import teamRoutes from './routes/team.routes';


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

// Rutas de Oportunidades (Deals)
app.use('/api/deals', dealRoutes);

// Rutas de Actividades (Activities)
app.use('/api/activities', activityRoutes);

app.use('/api/team', teamRoutes);

// Manejador de errores
app.use(errorHandler);


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(` Servidor CRM corriendo en http://localhost:${PORT}`);
});

export default app;