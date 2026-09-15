import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { checkRole } from '../middlewares/checkRole';
import { validate } from '../middlewares/validate';
import {
  createWorkflowSchema,
  workflowIdParamSchema,
} from '../schemas/workflow.schema';
import { workflowService } from '../services/workflow.service';

const router = Router();

router.use(authMiddleware);
router.use(checkRole(['ADMIN', 'SUPERADMIN']));

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await workflowService.getAll(req.user!.organizationId);
    res.json({ data: list });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  validate(createWorkflowSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const created = await workflowService.create(req.user!.organizationId, req.body);
      res.status(201).json({ message: 'Regla de automatización creada', data: created });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  validate(workflowIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await workflowService.delete(id, req.user!.organizationId);
      res.json({ message: 'Regla eliminada' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;