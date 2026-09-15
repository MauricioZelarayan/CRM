import { prisma } from '../config/prisma';
import { CreateDealDTO, UpdateDealStageDTO } from '../schemas/deal.schema';

export const dealService = {
  // Listar tratos del tenant actual
  async getAll(organizationId: string) {
    return prisma.deal.findMany({
      where: { organizationId }, // Aislamiento multi-tenant obligatorio
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Crear trato asegurando que el contacto también pertenezca a la misma organización
  async create(organizationId: string, data: CreateDealDTO) {
    if (data.contactId) {
      const contactExists = await prisma.contact.findFirst({
        where: {
          id: data.contactId,
          organizationId, // Evita vincular contactos de otros tenants[cite: 4]
        },
      });

      if (!contactExists) {
        throw new Error('El contacto asociado no pertenece a tu organización');
      }
    }

    return prisma.deal.create({
      data: {
        title: data.title,
        value: data.value,
        stage: data.stage,
        contactId: data.contactId || null,
        organizationId, // Forzado por backend, no por payload del cliente[cite: 4]
      },
    });
  },

  // Cambiar etapa comprobando tenencia
  async updateStage(id: string, organizationId: string, data: UpdateDealStageDTO) {
    // 1. Verificar existencia dentro del tenant
    const deal = await prisma.deal.findFirst({
      where: { id, organizationId },
    });

    if (!deal) {
      throw new Error('Trato u oportunidad no encontrada');
    }

    // 2. Actualizar de forma segura
    return prisma.deal.update({
      where: { id },
      data: { stage: data.stage },
    });
  },

  // Eliminar comprobando tenencia
  async delete(id: string, organizationId: string) {
    const deal = await prisma.deal.findFirst({
      where: { id, organizationId },
    });

    if (!deal) {
      throw new Error('Trato u oportunidad no encontrada');
    }

    return prisma.deal.delete({
      where: { id },
    });
  },
};