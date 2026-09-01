import { Request, Response, NextFunction } from 'express';

export const checkRole = (allowedRoles: Array<'SUPERADMIN' | 'ADMIN' | 'USER'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // OWASP #3: Validar que el usuario esté autenticado y tenga el rol adecuado
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