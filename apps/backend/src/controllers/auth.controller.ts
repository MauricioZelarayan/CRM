import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

const DUMMY_HASH = '$2b$12$e8YvXvXvXvXvXvXvXvXvXuK9Y8Q7W6E5R4T3Y2U1I0O9P8A7S6D5F';
const COOKIE_NAME = 'token';

// Helper para emitir cookies HttpOnly seguras (OWASP #2 y #4)
const setAuthCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, organizationName } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({ message: 'El correo electrónico ya se encuentra registrado' });
      return;
    }

    // Hash de contraseña con 12 rounds de bcrypt (OWASP #4)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Transacción atómica: Crea el Tenant (Organización) y el Administrador inicial
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
        },
      });

      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword, // Resuelto: campo 'password' según schema.prisma
          firstName,
          lastName: lastName || null,
          role: 'ADMIN',
          organizationId: organization.id,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          organizationId: true,
          createdAt: true,
        },
      });

      return { organization, user };
    });

    const token = jwt.sign(
      {
        id: result.user.id,
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        organizationId: result.user.organizationId,
      },
      process.env.JWT_SECRET || 'super_secret_jwt_key_crm_2026',
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    setAuthCookie(res, token);

    res.status(201).json({
      message: 'Registro exitoso',
      data: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { organization: true },
    });

    // Mitigación de Timing Attacks (OWASP #2): si el usuario no existe, corre un hash dummy
    const passwordToCompare = user ? user.password : DUMMY_HASH;
    const isMatch = await bcrypt.compare(password, passwordToCompare);

    if (!user || !isMatch) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      process.env.JWT_SECRET || 'super_secret_jwt_key_crm_2026',
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    setAuthCookie(res, token);

    res.json({
      message: 'Inicio de sesión exitoso',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Sesión cerrada exitosamente' });
};