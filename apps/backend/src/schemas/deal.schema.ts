import { z } from 'zod';

// Etapas permitidas según el enum de Prisma
export const DealStageEnum = z.enum(
  ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'],
  { message: 'Etapa comercial no válida' }
);

// Esquema de creación
export const createDealSchema = z.object({
  title: z
    .string({ message: 'El título es obligatorio' })
    .min(2, 'El título debe tener al menos 2 caracteres')
    .max(100, 'El título no puede superar los 100 caracteres')
    .trim(),
  // Monto: debe ser número positivo y con máximo 2 decimales
  value: z
    .number({ message: 'El monto debe ser un valor numérico' })
    .positive('El monto debe ser mayor a 0')
    .max(999999999.99, 'El monto excede el límite permitido')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'El monto solo puede tener hasta 2 decimales',
    }),
  stage: DealStageEnum.default('LEAD'),
  contactId: z.string().uuid('El ID de contacto debe ser un UUID válido').optional().nullable(),
});

// Esquema para actualización de etapa
export const updateDealStageSchema = z.object({
  stage: DealStageEnum,
});

// Esquema de validación del parámetro de ruta (:id)
export const dealParamsSchema = z.object({
  id: z.string().uuid('El identificador del trato debe ser un UUID válido'),
});

export type CreateDealDTO = z.infer<typeof createDealSchema>;
export type UpdateDealStageDTO = z.infer<typeof updateDealStageSchema>;
export type DealParams = z.infer<typeof dealParamsSchema>;