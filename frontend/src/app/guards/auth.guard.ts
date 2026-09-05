import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';


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
     
      return of(false);
    })
  );
};