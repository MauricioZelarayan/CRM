import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { loginRateLimiter, registerRateLimiter } from '../config/security';

const router = Router();

// Endpoints Públicos con Rate Limit y Turnstile CAPTCHA
router.post('/register', registerRateLimiter, validate(registerSchema), register);
router.post('/login', loginRateLimiter, validate(loginSchema), login);

// Endpoints Autenticados
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);

export default router;