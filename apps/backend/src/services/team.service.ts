import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import type { InviteUserDTO, UpdateMemberRoleDTO } from '../schemas/team.schema';

export const teamService = {
  // Lista únicamente usuarios que pertenecen a la misma organización
  async getMembers(organizationId: string) {
    return prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  // Da de alta un nuevo usuario dentro de la organización
  async inviteMember(organizationId: string, data: InviteUserDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('El correo electrónico ya se encuentra registrado en el sistema.');
    }

    const hashedPassword = await bcrypt.hash(data.tempPassword, 12);

    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName || null,
        role: data.role,
        organizationId, // Aislamiento garantizado
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
  },

  // Actualiza el rol de un usuario de la organización impidiendo la automodificación crítica
  async updateRole(
    memberId: string,
    currentUserId: string,
    organizationId: string,
    data: UpdateMemberRoleDTO
  ) {
    if (memberId === currentUserId) {
      throw new Error('No puedes modificar tu propio rol administrativo.');
    }

    const member = await prisma.user.findFirst({
      where: { id: memberId, organizationId },
    });

    if (!member) {
      throw new Error('Miembro no encontrado en tu organización.');
    }

    return prisma.user.update({
      where: { id: memberId },
      data: { role: data.role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  },
};