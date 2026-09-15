import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { checkRole } from '../middlewares/checkRole';
import { createContactSchema, contactIdParamSchema } from '../schemas/contact.schema';
import { getContacts, createContact, deleteContact } from '../controllers/contact.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getContacts);
router.post('/', validate(createContactSchema, 'body'), createContact);
router.delete('/:id', checkRole(['ADMIN', 'SUPERADMIN']), validate(contactIdParamSchema, 'params'), deleteContact);

export default router;