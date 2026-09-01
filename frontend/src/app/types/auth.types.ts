
/**
 * Tipos de usuario compartidos entre frontend y backend.
 * Estos DEBEN coincidir con los tipos del backend (UserResponse, UserPayload).
 */

export type UserRole = 'CLIENTE' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}
