import { z } from 'zod';

export const roleEnum = z.enum(['ADMIN', 'USER']);

export const inviteUserSchema = z.object({
  email: z.string().trim().toLowerCase().email('Correo electrónico inválido'),
  firstName: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  lastName: z.string().trim().max(50).optional().nullable(),
  role: roleEnum.default('USER'),
  tempPassword: z.string().min(8, 'La contraseña temporal debe tener al menos 8 caracteres'),
});

export const updateMemberRoleSchema = z.object({
  role: roleEnum,
});

export const memberIdParamSchema = z.object({
  id: z.string().uuid('ID de miembro inválido'),
});

export type InviteUserDTO = z.infer<typeof inviteUserSchema>;
export type UpdateMemberRoleDTO = z.infer<typeof updateMemberRoleSchema>;