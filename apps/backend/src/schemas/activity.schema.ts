import { z } from 'zod';

export const ActivityTypeEnum = z.enum(['NOTE', 'CALL', 'MEETING', 'EMAIL'], {
  message: 'Tipo de actividad inválido',
});

export const createActivitySchema = z.object({
  type: ActivityTypeEnum.default('NOTE'),
  title: z
    .string({ message: 'El título es obligatorio' })
    .min(2, 'Debe tener al menos 2 caracteres')
    .max(120, 'Máximo 120 caracteres')
    .trim(),
  description: z.string().trim().optional().nullable(),
  contactId: z.string().uuid('ID de contacto inválido'),
});

export type CreateActivityDTO = z.infer<typeof createActivitySchema>;