import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { checkRole } from '../middlewares/checkRole';
import { createActivitySchema } from '../schemas/activity.schema';
import {
  getActivitiesByContact,
  createActivity,
  deleteActivity,
} from '../controllers/activity.controller';

const router = Router();

router.use(authMiddleware);

router.get('/contact/:contactId', getActivitiesByContact);
router.post('/', validate(createActivitySchema, 'body'), createActivity);
router.delete('/:id', checkRole(['ADMIN', 'SUPERADMIN']), deleteActivity);

export default router;