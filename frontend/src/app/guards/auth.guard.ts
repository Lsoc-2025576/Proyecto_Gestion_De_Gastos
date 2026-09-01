import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Guard de autenticacion.
 * 
 * RESPONSABILIDAD: Proteger rutas para que solo usuarios autenticados puedan acceder.
 * 
 * FIX: Antes este guard solo revisaba el signal local (isAuthenticated()), que
 * arranca en null al recargar la pagina. Eso causaba que SIEMPRE redirigiera
 * a login al recargar, sin importar si la cookie seguia siendo valida, y sin
 * pasar nunca por el backend (por eso el interceptor y el toast de sesion
 * expirada nunca se activaban).
 * 
 * Ahora: el guard llama a checkSession(), que SI le pregunta al backend.
 * Si el backend responde 401 (cookie invalida o expirada), el interceptor
 * se encarga de notifySessionExpired() y mostrar el toast automaticamente.
 */

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkSession().pipe(
    map(response => {
      if (response.success && response.data?.user) {
        return true; // Sesion valida, permitir acceso
      }
      router.navigate(['/login']);
      return false;
    }),
    catchError(() => {
      // El interceptor ya maneja la redireccion y el toast en caso de 401.
      // Aqui solo evitamos que el guard truene si la peticion falla.
      return of(false);
    })
  );
};