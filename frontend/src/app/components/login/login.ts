import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  // Exponemos el signal directo del AuthService para usarlo en el HTML
  sessionExpired = this.authService.sessionExpired;

  login() {
    // Si el usuario intenta loguearse de nuevo, ocultamos el aviso de "sesion expirada"
    this.authService.clearSessionExpiredFlag();

    // Validacion basica antes de enviar
    if (!this.email || !this.password) {
      this.errorMessage = 'Email y contrasena son obligatorios.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            // FIX: El backend ya seteo la cookie. No guardamos nada en localStorage.
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.message || 'Error al iniciar sesion';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Error de conexion';
        }
      });
  }
}