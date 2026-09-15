import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  sku: z.string().trim().max(50).optional().nullable(),
  description: z.string().trim().max(255).optional().nullable(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo').default(0),
  active: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdParamSchema = z.object({
  id: z.string().uuid('ID de producto inválido'),
});

// Esquema para agregar/actualizar ítems dentro de un Deal
export const dealProductItemSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
  quantity: z.number().int().positive('La cantidad debe ser un entero positivo'),
  unitPrice: z.number().positive('El precio unitario debe ser positivo').optional(), // Opcional: toma el del catálogo si no se envía
});

export const updateDealLineItemsSchema = z.object({
  items: z.array(dealProductItemSchema),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type DealProductItemDTO = z.infer<typeof dealProductItemSchema>;