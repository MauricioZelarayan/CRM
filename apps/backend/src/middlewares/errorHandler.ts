import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.error('[Error]:', err);

  res.status(500).json({
    message: 'Ocurrió un error interno en el servidor.',
    ...(isProduction ? {} : { stack: err.stack }),
  });
};