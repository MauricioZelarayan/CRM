import { Role } from '@prisma/client';

export interface UserPayload {
  id: string;
  userId: string;
  email: string;
  role: Role;
  organizationId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}