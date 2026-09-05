import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  // Variable para mostrar el mensaje estético según el motivo de salida
  sessionMessage: string | null = null;

  ngOnInit() {
    
    const reason = this.route.snapshot.queryParamMap.get('reason');

    if (reason === 'inactivity') {
      this.sessionMessage = 'Tu sesión ha expirado debido a un periodo de inactividad.';
    } else if (reason === 'expired') {
      this.sessionMessage = 'Tu sesión ha caducado por seguridad. Por favor, inicia sesión de nuevo.';
    }
  }

  login() {
    
    this.authService.clearSessionExpiredFlag();

    if (!this.email || !this.password) {
      this.errorMessage = 'Email y contraseña son obligatorios.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.message || 'Error al iniciar sesión';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Error de conexión';
        }
      });
  }
}