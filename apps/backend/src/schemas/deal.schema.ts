import { z } from 'zod';

export const DealStageEnum = z.enum([
  'LEAD',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
]);

export const createDealSchema = z.object({
  title: z
    .string({ message: 'El título es obligatorio' })
    .min(2, 'El título debe tener al menos 2 caracteres')
    .max(100, 'El título no puede exceder los 100 caracteres')
    .trim(),
  value: z
    .number({ message: 'El valor es obligatorio' })
    .nonnegative('El valor no puede ser negativo'),
  stage: DealStageEnum.default('LEAD'),
  contactId: z.string().uuid('ID de contacto inválido').optional().nullable(),
});

export const updateDealStageSchema = z.object({
  stage: DealStageEnum,
});

export type CreateDealDTO = z.infer<typeof createDealSchema>;
export type UpdateDealStageDTO = z.infer<typeof updateDealStageSchema>;