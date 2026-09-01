import { prisma } from '../config/prisma';
import { type CreateDealDTO, type UpdateDealStageDTO } from '../schemas/deal.schema';

export const dealService = {
  async getAllByOrganization(organizationId: string) {
    return prisma.deal.findMany({
      where: { organizationId },
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

  async create(organizationId: string, data: CreateDealDTO) {
    if (data.contactId) {
      // Verificar que el contacto pertenezca a la misma organización
      const contactExists = await prisma.contact.findFirst({
        where: {
          id: data.contactId,
          organizationId,
        },
      });

      if (!contactExists) {
        throw new Error('El contacto asociado no existe en su organización');
      }
    }

    return prisma.deal.create({
      data: {
        title: data.title,
        value: data.value,
        stage: data.stage,
        contactId: data.contactId || null,
        organizationId,
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  async updateStage(id: string, organizationId: string, data: UpdateDealStageDTO) {
    const deal = await prisma.deal.findFirst({
      where: { id, organizationId },
    });

    if (!deal) {
      throw new Error('Trato u oportunidad no encontrada');
    }

    return prisma.deal.update({
      where: { id },
      data: { stage: data.stage },
    });
  },

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