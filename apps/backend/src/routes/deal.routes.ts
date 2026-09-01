import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { checkRole } from '../middlewares/checkRole';
import { createDealSchema, updateDealStageSchema } from '../schemas/deal.schema';
import {
  getDeals,
  createDeal,
  updateDealStage,
  deleteDeal,
} from '../controllers/deal.controller';

const router = Router();

// Todas las rutas requieren sesión autenticada mediante cookie HttpOnly
router.use(authMiddleware);

router.get('/', getDeals);
router.post('/', validate(createDealSchema), createDeal);
router.patch('/:id/stage', validate(updateDealStageSchema), updateDealStage);
router.delete('/:id', checkRole(['ADMIN', 'SUPERADMIN']), deleteDeal);

export default router;