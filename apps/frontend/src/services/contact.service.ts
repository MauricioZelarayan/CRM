import { api } from './api';

export interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface CreateContactDTO {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export const contactService = {
  getAll: async (): Promise<{ data: Contact[] }> => {
    const response = await api.get('/contacts');
    return response.data;
  },

  getById: async (id: string): Promise<{ data: Contact }> => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  create: async (data: CreateContactDTO): Promise<{ data: Contact }> => {
    const response = await api.post('/contacts', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateContactDTO>): Promise<{ data: Contact }> => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },
};