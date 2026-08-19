import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/auth';

  // Registrar Usuario
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Login de Usuario
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // Guardar el Token JWT en el navegador
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Obtener Token guardado
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Cerrar Sesión
  logout(): void {
    localStorage.removeItem('token');
  }
}