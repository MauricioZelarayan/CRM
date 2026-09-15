import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { checkRole } from '../middlewares/checkRole';
import { validate } from '../middlewares/validate';
import {
  createDealSchema,
  updateDealStageSchema,
  dealParamsSchema,
} from '../schemas/deal.schema';
import {
  getDeals,
  createDeal,
  updateDealStage,
  deleteDeal,
} from '../controllers/deal.controller';

const router = Router();

// Todas las rutas requieren sesión activa en Cookie HttpOnly
router.use(authMiddleware);

router.get('/', getDeals);

router.post(
  '/',
  validate(createDealSchema, 'body'),
  createDeal
);

router.patch(
  '/:id/stage',
  validate(dealParamsSchema, 'params'),
  validate(updateDealStageSchema, 'body'),
  updateDealStage
);

router.delete(
  '/:id',
  checkRole(['ADMIN', 'SUPERADMIN']), // Control de acceso por rol
  validate(dealParamsSchema, 'params'),
  deleteDeal
);

export default router;