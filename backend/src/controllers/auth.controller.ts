import { type Request, type Response } from 'express';
import { AuthService } from '../services/auth.services.js';
import { type AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { ValidationError } from '../middlewares/error-handler.middleware.js';

/**
 * Controller de autenticacion.
 * 
 * RESPONSABILIDAD: Recibir requests HTTP, extraer datos, llamar al Service, devolver responses.
 * 
 * REGLA:
 *   - SI importa express (req, res)
 *   - NO tiene logica de negocio (no pregunta "existe el email?")
 *   - NO hace try/catch (el errorHandler global lo hace)
 *   - NO valida a mano con "if (!email)" (usamos funciones helper)
 */

/**
 * Convierte el formato de tiempo de jsonwebtoken ('1m', '8h', '1d', etc.)
 * a milisegundos, para que la cookie use exactamente la misma duracion que el JWT.
 * 
 * FIX: Antes el maxAge de la cookie estaba hardcodeado en 8h, sin importar
 * lo que dijera JWT_EXPIRES_IN en el .env. Ahora ambos leen del mismo lugar,
 * asi que solo hay que tocar el .env para cambiar la duracion de la sesion.
 */
function getCookieMaxAge(): number {
  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  const match = expiresIn.match(/^(\d+)([smhd])$/);

  if (!match) return 1000 * 60 * 60 * 8; // fallback: 8 horas si el formato no es valido

  const value = parseInt(match[1]!);
  const unit = match[2]!;
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  };

  return value * multipliers[unit]!;
}

/**
 * Opciones de la cookie de sesion.
 * httpOnly: true  -> El frontend NO puede leerla con JS (protege contra XSS)
 * secure: true    -> Solo se envia por HTTPS (en produccion)
 * sameSite: strict-> No se envia en peticiones de otros sitios (protege contra CSRF)
 * maxAge          -> Lee JWT_EXPIRES_IN del .env, coincide REALMENTE con el JWT
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: getCookieMaxAge(),
};

/**
 * Valida que los campos obligatorios existan.
 * Si falta algo, lanza ValidationError que el errorHandler convierte en 400.
 * 
 * NOTA: Esto es una validacion basica. Si en el futuro quieres algo mas robusto
 * (email con formato, password minimo 6 chars, etc.), considera agregar Zod.
 */
function validateRegisterBody(body: any): { name: string; email: string; password: string } {
  const { name, email, password } = body;
  const missing: string[] = [];

  if (!name || typeof name !== 'string') missing.push('name');
  if (!email || typeof email !== 'string') missing.push('email');
  if (!password || typeof password !== 'string') missing.push('password');

  if (missing.length > 0) {
    throw new ValidationError(`Campos obligatorios faltantes: ${missing.join(', ')}`);
  }

  return { name, email, password };
}

function validateLoginBody(body: any): { email: string; password: string } {
  const { email, password } = body;
  const missing: string[] = [];

  if (!email || typeof email !== 'string') missing.push('email');
  if (!password || typeof password !== 'string') missing.push('password');

  if (missing.length > 0) {
    throw new ValidationError(`Campos obligatorios faltantes: ${missing.join(', ')}`);
  }

  return { email, password };
}

export class AuthController {
  /**
   * POST /api/auth/register
   * Registra un usuario nuevo.
   */
  static async register(req: Request, res: Response) {
    // Extraemos y validamos el body. Si falla, lanza ValidationError -> errorHandler responde 400.
    const { name, email, password } = validateRegisterBody(req.body);

    const newUser = await AuthService.registerUser({ name, email, password });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: { user: newUser },
    });
  }

  /**
   * POST /api/auth/login
   * Inicia sesion y setea la cookie con el JWT.
   */
  static async login(req: Request, res: Response) {
    const { email, password } = validateLoginBody(req.body);

    const { user, token } = await AuthService.loginUser(email, password);

    // El Controller es el UNICO lugar que sabe de cookies.
    // El Service solo devuelve el token string. Aqui decidimos donde ponerlo.
    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesion exitoso',
      data: { user },
    });
  }

  /**
   * POST /api/auth/logout
   * Borra la cookie de sesion.
   */
  static logout(req: Request, res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    });

    return res.status(200).json({
      success: true,
      message: 'Sesion cerrada',
    });
  }

  /**
   * GET /api/auth/me
   * Devuelve los datos del usuario autenticado.
   * req.user fue inyectado por authenticateToken.
   */
  static me(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  }
}