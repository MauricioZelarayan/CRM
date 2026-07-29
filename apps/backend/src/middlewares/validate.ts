import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError, ZodIssue } from 'zod';

export const validate = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Error de validación',
          // Usamos 'issues' en lugar de 'errors' (Zod v4) y tipamos 'e' explícitamente
          errors: error.issues.map((e: ZodIssue) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};