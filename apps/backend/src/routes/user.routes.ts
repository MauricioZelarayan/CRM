import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { updatePreferencesSchema } from '../schemas/user.schema';
import { prisma } from '../config/prisma';

const router = Router();
router.use(authMiddleware);

router.patch(
  '/preferences',
  validate(updatePreferencesSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: { theme: req.body.theme },
        select: { id: true, theme: true },
      });
      res.json({ message: 'Preferencia guardada', data: updatedUser });
    } catch (error) {
      next(error);
    }
  }
);

export default router;