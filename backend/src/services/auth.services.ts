import { prisma } from '../config/database.js';
import { type IUser, type UserPayload, type UserResponse } from '../interfaces/user.interface.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ConflictError, UnauthorizedError } from '../middlewares/error-handler.middleware.js';

/**
 * Service de autenticacion.
 * Contiene la logica de negocio: verificar emails, hashear passwords, generar JWTS etc.
 * 
 */


function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no esta definido en el .env. La app no puede arrancar sin una clave secreta.');
  }
  return secret;
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

export class AuthService {
  /**
   * Registra un usuario nuevo.
   * 
   * Logica:
   * 1. Verificar que el email no exista
   * 2. Hashear la contrasena con bcrypt
   * 3. Crear el usuario en la DB
   * 4. Devolver el usuario SIN la contrasena
   */
  static async registerUser(userData: IUser): Promise<UserResponse> {
    const { name, email, password, role } = userData;

    // Paso 1 Verificar que el email no este registrado
    const userExist = await prisma.user.findUnique({
      where: { email },
    });

    if (userExist) {
      throw new ConflictError('El correo electronico ya esta registrado.');
    }

    // Paso 2 Hashear la contrasena (nunca guardamos texto plano)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Paso 3 Crear usuario
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'CLIENTE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Paso 4: Devolver datos seguros
    return newUser as UserResponse;
  }

  /**
   * Inicia sesion de un usuario.
   * 
   * 1. Buscar usuario por email
   * 2. Comparar contrasena con bcrypt
   * 3. Generar JWT
   * 4. Devolver usuario + token
   */
  static async loginUser(
    email: string,
    passwordAttempt: string
  ): Promise<{ user: UserResponse; token: string }> {
    // Paso 1 Buscar usuario (incluye password hash para comparar)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Mensaje 
      throw new UnauthorizedError('Credenciales invalidas.');
    }

    // Paso 2 Comparar contrasenas
    const isPasswordValid = await bcrypt.compare(passwordAttempt, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales invalidas.');
    }

    // Paso 3 Crea firmar JWT
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role as 'CLIENTE' | 'ADMIN',
    };


    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'CLIENTE' | 'ADMIN',
      },
      token,
    };
  }
}
