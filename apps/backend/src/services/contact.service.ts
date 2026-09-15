import { prisma } from '../config/prisma';
import type { CreateContactDTO } from '../schemas/contact.schema';

export const contactService = {
  async getAll(organizationId: string) {
    return prisma.contact.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(organizationId: string, data: CreateContactDTO) {
    return prisma.contact.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName ? data.lastName.trim() : null,
        email: data.email ? data.email.trim().toLowerCase() : null,
        phone: data.phone ? data.phone.trim() : null,
        organizationId, // Aislamiento garantizado
      },
    });
  },

  async delete(id: string, organizationId: string) {
    const contact = await prisma.contact.findFirst({
      where: { id, organizationId },
    });

    if (!contact) {
      throw new Error('Contacto no encontrado en su organización');
    }

    return prisma.contact.delete({
      where: { id },
    });
  },
};