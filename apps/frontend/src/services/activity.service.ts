import { api } from './api';

export type ActivityType = 'NOTE' | 'CALL' | 'MEETING' | 'EMAIL';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  contactId: string;
  createdAt: string;
}

export interface CreateActivityDTO {
  type: ActivityType;
  title: string;
  description?: string | null;
  contactId: string;
}

export const activityService = {
  getByContact: (contactId: string) =>
    api.get<{ data: Activity[] }>(`/activities/contact/${contactId}`),
  create: (data: CreateActivityDTO) =>
    api.post<{ data: Activity }>('/activities', data),
  delete: (id: string) =>
    api.delete(`/activities/${id}`),
};