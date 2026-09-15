import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';

export const validate = (
  schema: ZodType,
  target: 'body' | 'params' | 'query' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req[target] = await schema.parseAsync(req[target]);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: 'Error de validación en la solicitud',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};