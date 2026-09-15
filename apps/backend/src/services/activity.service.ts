import { prisma } from '../config/prisma';
import { CreateActivityDTO } from '../schemas/activity.schema';

export const activityService = {
  async getByContact(contactId: string, organizationId: string) {
    // Validar tenencia del contacto antes de leer bitácoras
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, organizationId },
    });

    if (!contact) {
      throw new Error('Contacto no encontrado en su organización');
    }

    return prisma.activity.findMany({
      where: { contactId, organizationId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(organizationId: string, data: CreateActivityDTO) {
    // Verificar que el contacto pertenezca a la misma organización
    const contact = await prisma.contact.findFirst({
      where: { id: data.contactId, organizationId },
    });

    if (!contact) {
      throw new Error('El contacto asociado no pertenece a su organización');
    }

    return prisma.activity.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description || null,
        contactId: data.contactId,
        organizationId,
      },
    });
  },

  async delete(id: string, organizationId: string) {
    const activity = await prisma.activity.findFirst({
      where: { id, organizationId },
    });

    if (!activity) {
      throw new Error('Actividad no encontrada');
    }

    return prisma.activity.delete({
      where: { id },
    });
  },
};