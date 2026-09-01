import { prisma } from '../config/prisma';

export interface CreateContactDTO {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  organizationId: string;
}

export interface UpdateContactDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export const getAllContacts = async (organizationId: string) => {
  return prisma.contact.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getContactById = async (id: string, organizationId: string) => {
  return prisma.contact.findFirst({
    where: {
      id,
      organizationId, // Aislamiento multi-tenant obligatorio (OWASP #3)
    },
  });
};

export const createContact = async (data: CreateContactDTO) => {
  return prisma.contact.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      organizationId: data.organizationId,
    },
  });
};

export const updateContact = async (id: string, organizationId: string, data: UpdateContactDTO) => {
  // Verificamos pertenencia al tenant antes de actualizar
  const contact = await prisma.contact.findFirst({
    where: { id, organizationId },
  });

  if (!contact) return null;

  return prisma.contact.update({
    where: { id },
    data,
  });
};

export const deleteContact = async (id: string, organizationId: string) => {
  // Verificamos pertenencia al tenant antes de eliminar
  const contact = await prisma.contact.findFirst({
    where: { id, organizationId },
  });

  if (!contact) return null;

  return prisma.contact.delete({
    where: { id },
  });
};