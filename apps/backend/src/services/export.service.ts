import { prisma } from '../config/prisma';

export const exportService = {
  async getDealsCsv(organizationId: string): Promise<string> {
    const deals = await prisma.deal.findMany({
      where: { organizationId },
      include: {
        contact: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['ID', 'Titulo', 'Valor', 'Etapa', 'Contacto', 'Email Contacto', 'Fecha Creacion'];
    const rows = deals.map((d) => [
      d.id,
      `"${d.title.replace(/"/g, '""')}"`,
      d.value.toString(),
      d.stage,
      `"${d.contact ? `${d.contact.firstName} ${d.contact.lastName || ''}`.trim() : ''}"`,
      d.contact?.email || '',
      d.createdAt.toISOString(),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  async getContactsCsv(organizationId: string): Promise<string> {
    const contacts = await prisma.contact.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['ID', 'Nombre', 'Apellido', 'Email', 'Telefono', 'Fecha Creacion'];
    const rows = contacts.map((c) => [
      c.id,
      `"${c.firstName.replace(/"/g, '""')}"`,
      `"${(c.lastName || '').replace(/"/g, '""')}"`,
      c.email || '',
      c.phone || '',
      c.createdAt.toISOString(),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};