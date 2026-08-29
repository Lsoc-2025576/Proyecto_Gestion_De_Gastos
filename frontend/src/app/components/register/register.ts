import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  onRegister(event: Event) {
    event.preventDefault();

    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register({ name: this.name, email: this.email, password: this.password })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            alert('¡Cuenta creada con éxito! Por favor inicia sesión.');
            this.router.navigate(['/login']);
          } else {
            this.errorMessage = response.message || 'Error al registrar usuario';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'No se pudo conectar con el servidor backend.';
        }
      });
  }
}