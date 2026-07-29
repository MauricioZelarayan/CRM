import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export const checkRole = (allowedRoles: Array<'SUPERADMIN' | 'ADMIN' | 'USER'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Acceso no autorizado.' });
    }

    const hasPermission = allowedRoles.includes(req.user.role as 'SUPERADMIN' | 'ADMIN' | 'USER');

    if (!hasPermission) {
      return res.status(403).json({
        message: 'No tienes los permisos necesarios para realizar esta acción.',
      });
    }

    next();
  };
};