import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { type User, type ApiResponse, type LoginCredentials, type RegisterData } from '../types/auth.types';

/**
 * Service de autenticacion centralizado.
 * 
 * FIX IMPORTANTE: El backend usa cookies (httpOnly) para el JWT.
 * Antes este service guardaba el token en localStorage (inseguro contra XSS)
 * y el backend usaba cookies. Eran DOS sistemas que no se entendian.
 * 
 * Ahora:
 * - El backend setea la cookie automaticamente al hacer login.
 * - El frontend envia la cookie en CADA peticion con 'withCredentials: true'.
 * - NO guardamos el JWT en localStorage (la cookie httpOnly es mas segura).
 * - El estado del usuario se maneja con signals (Angular moderno, compatible con zoneless).
 */

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/api/auth';

  /**
   * Signal que guarda el usuario autenticado.
   * Usamos signal() en vez de variables normales porque:
   * 1. Funciona perfecto con zoneless change detection
   * 2. Es reactivo: cualquier componente que lo lea se actualiza automaticamente
   * 3. Es inmutable: solo se cambia mediante setUser() y clearUser()
   */
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  /** True si ya verificamos el estado de autenticacion (para evitar parpadeos) */
  private _authChecked = signal(false);
  readonly authChecked = this._authChecked.asReadonly();

  /** True cuando el usuario fue deslogueado automaticamente por sesion expirada (401) */
  private _sessionExpired = signal(false);
  readonly sessionExpired = this._sessionExpired.asReadonly();

  /**
   * Verifica si hay una sesion activa preguntando al backend.
   * El backend lee la cookie y responde con los datos del usuario.
   * 
   * Se llama al iniciar la app (en el guard o en app.component)
   * para saber si el usuario ya esta logueado.
   */
  checkSession(): Observable<ApiResponse<{ user: User }>> {
    return this.http.get<ApiResponse<{ user: User }>>(
      `${this.apiUrl}/me`,
      { withCredentials: true } // Envia la cookie automaticamente
    ).pipe(
      tap(response => {
        if (response.success && response.data?.user) {
          this._user.set(response.data.user);
        } else {
          this._user.set(null);
        }
        this._authChecked.set(true);
      }),
      catchError(error => {
        this._user.set(null);
        this._authChecked.set(true);
        return throwError(() => error);
      })
    );
  }

  /**
   * Inicia sesion.
   * El backend setea la cookie httpOnly con el JWT.
   * Nosotros solo recibimos los datos del usuario.
   */
  login(credentials: LoginCredentials): Observable<ApiResponse<{ user: User }>> {
    // Limpiamos cualquier residuo previo en localStorage para evitar conflictos de cuentas
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return this.http.post<ApiResponse<{ user: User }>>(
      `${this.apiUrl}/login`,
      credentials,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success && response.data?.user) {
          this._user.set(response.data.user);
          
          // Guardamos el timestamp exacto en el que caducará la sesión basado en el tiempo configurado
          const expirationMs = 10 * 1000
          30 * 60 * 1000; 
          

          const expirationTime = new Date().getTime() + expirationMs;
          localStorage.setItem('tokenExpirationTime', expirationTime.toString());
        }
      })
    );
  }

  /**
   * Registra un usuario nuevo.
   */
  register(userData: RegisterData): Observable<ApiResponse<{ user: User }>> {
    return this.http.post<ApiResponse<{ user: User }>>(
      `${this.apiUrl}/register`,
      userData
    );
  }

  /**
   * Cierra sesion.
   * El backend borra la cookie. Nosotros limpiamos el estado local.
   */
  logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.clearUser();
      })
    );
  }

  /** Devuelve true si hay un usuario autenticado */
  isAuthenticated(): boolean {
    return this._user() !== null;
  }

  /** Devuelve true si el usuario es ADMIN */
  isAdmin(): boolean {
    return this._user()?.role === 'ADMIN';
  }

  /** Limpia el estado del usuario (usado en logout o cuando el token expira) */
  clearUser(): void {
    this._user.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpirationTime');
  }

  /**
   * Marca la sesion como expirada (activa el signal 'sessionExpired')
   * y limpia el usuario del estado local.
   * Llamado por el HttpInterceptor cuando el backend responde 401.
   */
  notifySessionExpired(): void {
    this._sessionExpired.set(true);
    this.clearUser();
  }

  /**
   * Limpia la bandera de sesion expirada.
   * Se llama cuando el usuario vuelve a intentar loguearse,
   * para que el aviso no se quede pegado en pantalla para siempre.
   */
  clearSessionExpiredFlag(): void {
    this._sessionExpired.set(false);
  }
}