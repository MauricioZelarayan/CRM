import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { verifyTurnstileToken } from '../services/turnstile.service';
import { AuthenticatedRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, turnstileToken } = req.body;

    // 1. Validar Turnstile CAPTCHA
    const isCaptchaValid = await verifyTurnstileToken(turnstileToken, req.ip);
    if (!isCaptchaValid) {
      return res.status(400).json({ message: 'Error de validación de seguridad (CAPTCHA inválido).' });
    }

    // 2. Buscar usuario en base de datos
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 3. Verificar contraseña con Bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 4. Firmar JWT especifíco con HS256
    const token = jwt.sign(
      {
        userId: user.id,
        organizationId: user.organizationId,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { algorithm: 'HS256', expiresIn: '8h' }
    );

    // 5. Establecer Cookie HttpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
    });

    return res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationName, firstName, lastName, email, password, turnstileToken } = req.body;

    // 1. Validar Turnstile CAPTCHA
    const isCaptchaValid = await verifyTurnstileToken(turnstileToken, req.ip);
    if (!isCaptchaValid) {
      return res.status(400).json({ message: 'Error de validación de seguridad (CAPTCHA inválido).' });
    }

    // 2. Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // 3. Hash de contraseña con bcrypt (OWASP #4)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Crear Organización y Usuario dentro de una Transacción
    const result = await prisma.$transaction(async (tx) => {
      // Generar slug básico para la organización
      const slug = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          role: 'ADMIN',
          organizationId: organization.id,
        },
      });

      return { organization, user };
    });

    // 5. Emitir JWT firmada
    const token = jwt.sign(
      {
        userId: result.user.id,
        organizationId: result.organization.id,
        role: result.user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );

    // 6. Configurar Cookie HttpOnly (OWASP #2)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
    });

    return res.status(201).json({
      message: 'Registro exitoso.',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        organizationId: result.organization.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
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
              slug: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      return res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  };

export const logout = async (req: Request, res: Response) => {
  // Limpiamos la cookie pasando los mismos parámetros con los que fue creada
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.status(200).json({ message: 'Sesión cerrada correctamente.' });
};