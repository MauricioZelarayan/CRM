import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    organizationName: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'),
    firstName: z.string().min(2, 'El nombre es requerido'),
    lastName: z.string().min(2, 'El apellido es requerido'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    turnstileToken: z.string().min(1, 'La verificación de seguridad (CAPTCHA) es requerida'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
    turnstileToken: z.string().min(1, 'La verificación de seguridad (CAPTCHA) es requerida'),
  }),
});