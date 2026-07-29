import { Router } from 'express';
import { register } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { registerSchema } from '../schemas/auth.schema';
import { authRateLimiter } from '../config/security';

const router = Router();

// Endpoint con Rate Limiter y validación Zod
router.post('/register', authRateLimiter, validate(registerSchema), register);

export default router;