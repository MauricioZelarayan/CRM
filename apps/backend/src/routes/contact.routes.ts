import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { checkRole } from '../middlewares/checkRole';
import { validate } from '../middlewares/validate';
import {
  createContactSchema,
  updateContactSchema,
  getContactByIdSchema,
} from '../schemas/contact.schema';
import * as contactController from '../controllers/contact.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', contactController.getContacts);
router.get('/:id', validate(getContactByIdSchema), contactController.getContact);
router.post('/', validate(createContactSchema), contactController.createContact);
router.put('/:id', validate(updateContactSchema), contactController.updateContact);
router.delete(
  '/:id',
  checkRole(['ADMIN', 'SUPERADMIN']),
  validate(getContactByIdSchema),
  contactController.deleteContact
);

export default router;