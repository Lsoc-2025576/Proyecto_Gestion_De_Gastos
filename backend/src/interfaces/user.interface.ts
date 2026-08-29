/**
 * Tipos de usuario usados en toda la aplicacion.
 * 
 * NOTA: Estos son tipos de TypeScript (interfaces), NO son validacion de runtime.
 * Para validar datos de entrada (req.body) usamos validacion manual en el controller
 * o podemos agregar una libreria como Zod mas adelante.
 */

export type UserRole = 'CLIENTE' | 'ADMIN';

/**
 * Datos que vienen del frontend al registrarse.
 * La password es string (no undefined) porque la validamos en el controller.
 */
export interface IUser {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * Datos que guardamos DENTRO del token JWT.
 * Es lo minimo necesario para identificar al usuario en cada peticion.
 */
export interface UserPayload {
  id: number;
  email: string;
  role: UserRole;
}

/**
 * Respuesta segura: usuario SIN la contrasena.
 * Esto es lo que devolvemos al frontend despues de login/register.
 */
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
