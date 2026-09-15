import { z } from 'zod';

export const DealStageEnum = z.enum(
  ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'],
  { message: 'Etapa comercial no válida' }
);

// Campos comunes que siempre se deben enviar
const baseDealSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres').max(100),
  contactId: z.string().uuid('ID de contacto inválido').optional().nullable(),
  stage: DealStageEnum.default('LEAD'),
});

// Variante A: Cotización por Catálogo
const catalogDealSchema = baseDealSchema.extend({
  quoteType: z.literal('CATALOG'),
  productId: z.string().uuid('Debe enviar un ID de producto válido'),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0').default(1),
});

// Variante B: Cotización Manual Libre
const manualDealSchema = baseDealSchema.extend({
  quoteType: z.literal('MANUAL'),
  manualValue: z.number().min(0, 'El valor no puede ser negativo').default(0),
});

// Unión discriminada: Zod mirará 'quoteType' para decidir qué reglas aplicar
export const createDealSchema = z.discriminatedUnion('quoteType', [
  catalogDealSchema,
  manualDealSchema,
]);

export const updateDealStageSchema = z.object({
  stage: DealStageEnum,
});

export const dealParamsSchema = z.object({
  id: z.string().uuid('El identificador del trato debe ser un UUID válido'),
});

export type CreateDealDTO = z.infer<typeof createDealSchema>;
export type UpdateDealStageDTO = z.infer<typeof updateDealStageSchema>;
export type DealParams = z.infer<typeof dealParamsSchema>;