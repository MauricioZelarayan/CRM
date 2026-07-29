import { z } from 'zod';

export const createContactSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'El nombre es obligatorio'),
    lastName: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
  }),
});

export const updateContactSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de contacto inválido'),
  }),
  body: z.object({
    firstName: z.string().min(1, 'El nombre es obligatorio').optional(),
    lastName: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
  }),
});

export const getContactByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de contacto inválido'),
  }),
});