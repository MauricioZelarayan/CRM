import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { analyticsService } from '../services/analytics.service';

const router = Router();

// OWASP #2 y #3: Requiere sesión activa en cookies HttpOnly y extrae organizationId
router.use(authMiddleware);

router.get('/dashboard', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const metrics = await analyticsService.getDashboardMetrics(req.user!.organizationId);
    res.json({ data: metrics });
  } catch (error) {
    next(error);
  }
});

export default router;