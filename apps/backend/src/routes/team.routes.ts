import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { checkRole } from '../middlewares/checkRole';
import { validate } from '../middlewares/validate';
import {
  inviteUserSchema,
  updateMemberRoleSchema,
  memberIdParamSchema,
} from '../schemas/team.schema';
import { teamService } from '../services/team.service';

const router = Router();

// OWASP #2 y #3: Autenticación obligatoria y control RBAC
router.use(authMiddleware);
router.use(checkRole(['ADMIN', 'SUPERADMIN']));

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await teamService.getMembers(req.user!.organizationId);
    res.json({ data: members });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/invite',
  validate(inviteUserSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newMember = await teamService.inviteMember(
        req.user!.organizationId,
        req.body
      );
      res.status(201).json({ message: 'Miembro agregado exitosamente', data: newMember });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id/role',
  validate(memberIdParamSchema, 'params'),
  validate(updateMemberRoleSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const memberId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await teamService.updateRole(
        memberId,
        req.user!.id,
        req.user!.organizationId,
        req.body
      );
      res.json({ message: 'Rol actualizado', data: updated });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
