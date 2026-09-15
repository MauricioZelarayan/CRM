import { api } from './api';

export type Role = 'ADMIN' | 'USER';

export interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  role: Role;
  createdAt: string;
}

export interface InviteMemberDTO {
  email: string;
  firstName: string;
  lastName?: string;
  role: Role;
  tempPassword: string;
}

export const teamService = {
  getMembers: async (): Promise<TeamMember[]> => {
    const res = await api.get<{ data: TeamMember[] }>('/team');
    return res.data.data;
  },

  inviteMember: async (data: InviteMemberDTO): Promise<TeamMember> => {
    const res = await api.post<{ message: string; data: TeamMember }>('/team/invite', data);
    return res.data.data;
  },

  updateRole: async (id: string, role: Role): Promise<TeamMember> => {
    const res = await api.patch<{ message: string; data: TeamMember }>(`/team/${id}/role`, { role });
    return res.data.data;
  },
};