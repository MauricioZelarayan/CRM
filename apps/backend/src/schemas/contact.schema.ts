import { z } from 'zod';

export const createContactSchema = z.object({
  firstName: z
    .string({ message: 'El nombre es obligatorio' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede superar los 50 caracteres'),
  lastName: z
    .string()
    .trim()
    .max(50, 'El apellido no puede superar los 50 caracteres')
    .optional()
    .nullable()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Formato de correo electrónico inválido')
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .max(25, 'Número de teléfono demasiado largo')
    .optional()
    .nullable()
    .or(z.literal('')),
});

export const contactIdParamSchema = z.object({
  id: z.string().uuid('El identificador debe ser un UUID válido'),
});

export type CreateContactDTO = z.infer<typeof createContactSchema>;