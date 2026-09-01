import { api } from './api';

export type DealStage = 'LEAD' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface Deal {
  id: string;
  title: string;
  value: number | string;
  stage: DealStage;
  contactId?: string | null;
  contact?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    email?: string | null;
  } | null;
  createdAt: string;
}

export interface CreateDealDTO {
  title: string;
  value: number;
  stage: DealStage;
  contactId?: string | null;
}

export const dealService = {
  getAll: () => api.get<{ data: Deal[] }>('/deals'),
  create: (data: CreateDealDTO) => api.post<{ data: Deal }>('/deals', data),
  updateStage: (id: string, stage: DealStage) =>
    api.patch<{ data: Deal }>(`/deals/${id}/stage`, { stage }),
  delete: (id: string) => api.delete(`/deals/${id}`),
};