import { z } from 'zod';

export const triggerEventEnum = z.enum([
  'DEAL_STAGE_CHANGED',
  'DEAL_WON',
  'CONTACT_CREATED',
]);

export const actionTypeEnum = z.enum([
  'CREATE_TASK',
  'SEND_EMAIL',
  'NOTIFY_TEAM',
]);

export const workflowActionSchema = z.object({
  actionType: actionTypeEnum,
  payload: z.record(z.string(), z.any()), // Objeto flexible pero tipado para configuración de la acción
});

export const createWorkflowSchema = z.object({
  name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  description: z.string().trim().max(255).optional(),
  triggerEvent: triggerEventEnum,
  active: z.boolean().default(true),
  actions: z.array(workflowActionSchema).min(1, 'Debe incluir al menos una acción'),
});

export const updateWorkflowSchema = createWorkflowSchema.partial();

export const workflowIdParamSchema = z.object({
  id: z.string().uuid('ID de workflow inválido'),
});

export type CreateWorkflowDTO = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowDTO = z.infer<typeof updateWorkflowSchema>;