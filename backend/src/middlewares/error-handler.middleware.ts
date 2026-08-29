import { type Request, type Response, type NextFunction } from 'express';

/**
 * Clase base para errores controlados de la aplicacion.
 * Permite que el errorHandler sepa si un error es un 400, 401, 403, etc.
 * 
 * Antes tenias try/catch copiados en cada controller con res.status(400).json(...).
 * Ahora los controllers pueden hacer "throw new AppError('...', 400)" y este middleware
 * se encarga de responder con el formato correcto.
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso denegado') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Middleware de manejo de errores GLOBAL.
 * Va al FINAL de app.ts. Atrapa TODOS los errores de controllers y services.
 * 
 * BENEFICIO: Los controllers ya no necesitan try/catch. Si algo falla,
 * el error sube por la pila y este middleware lo atrapa.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Si es un error nuestro (controlado), respondemos con el status y mensaje definidos
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // Si es un error inesperado (bug), NO leakamos detalles al cliente
  console.error('🔥 Error no manejado:', err);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
  });
};
