import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { checkRole } from '../middlewares/checkRole';
import { validate } from '../middlewares/validate';
import {
  createContactSchema,
  updateContactSchema,
  getContactByIdSchema,
} from '../schemas/contact.schema';
import * as contactController from '../controllers/contact.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', contactController.getContacts);
router.get('/:id', validate(getContactByIdSchema), contactController.getContact);
router.post('/', validate(createContactSchema), contactController.createContact);
router.put('/:id', validate(updateContactSchema), contactController.updateContact);

// Solo ADMIN o SUPERADMIN pueden eliminar contactos
router.delete(
  '/:id',
  checkRole(['ADMIN', 'SUPERADMIN']),
  validate(getContactByIdSchema),
  contactController.deleteContact
);

export default router;