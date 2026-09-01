import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/express';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    res.status(401).json({ message: 'No autenticado. Token no provisto.' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret'
    ) as UserPayload;

    // Sincronizamos id y userId para compatibilidad total
    req.user = {
      ...decoded,
      id: decoded.id || decoded.userId,
      userId: decoded.userId || decoded.id,
    };

    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};