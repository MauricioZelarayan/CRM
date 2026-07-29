import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateContactDTO {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  organizationId: string;
}

interface UpdateContactDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export const getAllContacts = async (organizationId: string) => {
  return await prisma.contact.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getContactById = async (id: string, organizationId: string) => {
  return await prisma.contact.findFirst({
    where: {
      id,
      organizationId, // Aislamiento por Tenant
    },
  });
};

export const createContact = async (data: CreateContactDTO) => {
  return await prisma.contact.create({
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
  // Aseguramos primero que el recurso pertenezca a la organización antes de actualizar
  const contact = await prisma.contact.findFirst({
    where: { id, organizationId },
  });

  if (!contact) return null;

  return await prisma.contact.update({
    where: { id },
    data,
  });
};

export const deleteContact = async (id: string, organizationId: string) => {
  const contact = await prisma.contact.findFirst({
    where: { id, organizationId },
  });

  if (!contact) return null;

  return await prisma.contact.delete({
    where: { id },
  });
};