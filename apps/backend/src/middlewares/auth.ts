import {Request, Response,NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Exportación limpia de la interfaz extendiendo Request
export interface AuthenticatedRequest<
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    userId: string;
    organizationId: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No autenticado.' });
  }

  try {
    // Forzamos la verificación estricta usando únicamente el algoritmo HS256
    const payload = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ['HS256'],
    }) as {
      userId: string;
      organizationId: string;
      role: string;
    };

    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }
};