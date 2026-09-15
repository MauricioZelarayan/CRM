import { prisma } from '../config/prisma';
import type { CreateWorkflowDTO, UpdateWorkflowDTO } from '../schemas/workflow.schema';
import { TriggerEvent, ActionType } from '@prisma/client';

export const workflowService = {
  // CRUD de Reglas Multi-Tenant (OWASP #3)
  async getAll(organizationId: string) {
    return prisma.workflow.findMany({
      where: { organizationId },
      include: { actions: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(organizationId: string, data: CreateWorkflowDTO) {
    return prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        triggerEvent: data.triggerEvent,
        active: data.active,
        organizationId, // Aislamiento garantizado
        actions: {
          create: data.actions.map((act) => ({
            actionType: act.actionType,
            payload: act.payload,
          })),
        },
      },
      include: { actions: true },
    });
  },

  async toggleActive(id: string, organizationId: string, active: boolean) {
    const wf = await prisma.workflow.findFirst({ where: { id, organizationId } });
    if (!wf) throw new Error('Workflow no encontrado en su organización.');

    return prisma.workflow.update({
      where: { id },
      data: { active },
    });
  },

  async delete(id: string, organizationId: string) {
    const wf = await prisma.workflow.findFirst({ where: { id, organizationId } });
    if (!wf) throw new Error('Workflow no encontrado en su organización.');

    return prisma.workflow.delete({ where: { id } });
  },

  // MOTOR DESPACHADOR: Se dispara desde otros servicios (ej: dealService)
  async dispatchEvent(
    event: TriggerEvent,
    organizationId: string,
    context: { contactId?: string; dealId?: string; title?: string }
  ) {
    const workflows = await prisma.workflow.findMany({
      where: {
        organizationId,
        triggerEvent: event,
        active: true,
      },
      include: { actions: true },
    });

    for (const wf of workflows) {
      for (const action of wf.actions) {
        await this.executeAction(action.actionType, action.payload, organizationId, context);
      }
    }
  },

  async executeAction(
    actionType: ActionType,
    payload: any,
    organizationId: string,
    context: { contactId?: string; dealId?: string; title?: string }
  ) {
    switch (actionType) {
      case 'CREATE_TASK':
        if (context.contactId) {
          await prisma.activity.create({
            data: {
              type: 'NOTE',
              title: payload.title || `Seguimiento automático: ${context.title || 'Oportunidad'}`,
              description: payload.description || 'Tarea generada automáticamente por regla de workflow.',
              contactId: context.contactId,
              organizationId,
            },
          });
        }
        break;

      case 'NOTIFY_TEAM':
        console.log(`[NOTIFY_TEAM][Tenant ${organizationId}]: ${payload.message || 'Alerta comercial disparada'}`);
        break;

      case 'SEND_EMAIL':
        console.log(`[SEND_EMAIL][Tenant ${organizationId}]: Simulando envío a plantilla ${payload.templateId}`);
        break;
    }
  },
};