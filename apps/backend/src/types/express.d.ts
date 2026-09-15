import { Role } from '@prisma/client';

export interface UserPayload {
  id: string;
  email: string;
  userId: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'USER';
  organizationId: string;
  organizationName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}