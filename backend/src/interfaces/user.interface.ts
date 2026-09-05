
export type UserRole = 'CLIENTE' | 'ADMIN';


export interface IUser {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * Datos que guardamos DENTRO del token JWT.
 */
export interface UserPayload {
  id: number;
  email: string;
  role: UserRole;
}

/**
 * Respuesta: usuario SIN la contrasena.
 */
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
