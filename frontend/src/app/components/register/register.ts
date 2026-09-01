import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = '';
  isLoading = false;

  // Definimos el formulario reactivo con las mismas reglas estrictas del backend
  registerForm: FormGroup = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/) // Solo letras y espacios
    ]],
    email: ['', [
      Validators.required,
      Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) // Sintaxis real de correo
    ]],
    password: ['', [
      Validators.required,
      Validators.pattern(/^\d{4,}$/) // Solo números, mínimo 4 dígitos
    ]]
  });

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Por favor, corrige los errores en el formulario antes de continuar.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password } = this.registerForm.value;

    this.authService.register({ name, email, password })
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

//1