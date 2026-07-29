import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { authRateLimiter } from '../config/security';

const router = Router();

// Endpoints Públicos con Rate Limit y Turnstile CAPTCHA
router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);

// Endpoints Autenticados
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

export default router;