import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { type UserPayload } from '../interfaces/user.interface.js';


export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    //Leer token de cookie de header Bearer
    const tokenFromCookie = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token no proporcionado.',
        code: 'UNAUTHORIZED',
      });
    }

    //Verificar firma y expiracion del JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no esta definido en el .env');
    }

    const decoded = jwt.verify(token, secret) as UserPayload;

    //Verificar que el usuario sigue existiendo en la DB
    //Esto evita que un token valido de un usuario eliminado siga funcionando.
    const userExists = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true },
    });

    if (!userExists) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado. Es posible que tu cuenta haya sido eliminada.',
        code: 'UNAUTHORIZED',
      });
    }

    //Adjuntar usuario al request para que los controllers lo usen
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Tu sesion ha expirado. Por favor inicia sesion de nuevo.',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({
        success: false,
        message: 'Token invalido.',
        code: 'FORBIDDEN',
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Token invalido o expirado.',
      code: 'FORBIDDEN',
    });
  }
};
