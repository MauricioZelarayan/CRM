import { api } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'USER';
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface RegisterDTO {
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  turnstileToken: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  turnstileToken: string;
}

export const authService = {
  register: async (data: RegisterDTO) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginDTO) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<{ data: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};