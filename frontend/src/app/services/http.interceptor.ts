import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Interceptor HTTP global.
 * 
 * RESPONSABILIDAD: Intercepta TODAS las peticiones HTTP de la app
 * y aplica logica comun antes de enviarlas o despues de recibir la respuesta.
 * 
 * Antes: cada componente manejaba errores a su manera (fetch + try/catch repetido).
 * Ahora: un solo lugar maneja 401, 403, y errores de red.
 * 
 * BENEFICIOS:
 * - Si el backend responde 401 (token expirado), redirigimos a login automaticamente.
 * - Si hay error de red, mostramos un mensaje consistente.
 * - No repetimos codigo de manejo de errores en cada componente.
 */

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Clonamos la request para agregar withCredentials si no esta presente
  // Esto asegura que las cookies se envien en TODAS las peticiones al backend
  const authReq = req.clone({
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Error desconocido';

      if (error.error instanceof ErrorEvent) {
        // Error de red (backend caido, sin internet)
        message = 'No se pudo conectar con el servidor. Verifica tu conexion.';
      } else {
        // Error del backend
        switch (error.status) {
          case 0:
            message = 'Servidor no disponible. Verifica que el backend este corriendo.';
            break;
          case 400:
            message = error.error?.message || 'Solicitud invalida';
            break;
          case 401:
            message = error.error?.message || 'Sesion expirada. Por favor inicia sesion.';
            authService.notifySessionExpired();
            router.navigate(['/login']);
            break;
          case 403:
            message = error.error?.message || 'No tienes permisos para realizar esta accion.';
            break;
          case 404:
            message = error.error?.message || 'Recurso no encontrado.';
            break;
          case 409:
            message = error.error?.message || 'Conflicto con los datos existentes.';
            break;
          case 500:
            message = 'Error interno del servidor. Intentalo mas tarde.';
            break;
          default:
            message = error.error?.message || `Error ${error.status}`;
        }
      }

      // Log para desarrollo
      console.error(`[HTTP ${error.status}]`, message, error);

      // Relanzamos el error para que el componente tambien lo pueda manejar si quiere
      return throwError(() => new Error(message));
    })
  );
};